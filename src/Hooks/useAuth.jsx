/**
 * useAuth Hook
 *
 * Manages authentication state and provides methods for:
 * - User sign up and sign in (email/password and OAuth)
 * - Session management
 * - Password reset
 * - Two-factor authentication (2FA/MFA)
 * - User profile management
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../config/supabase";
import { message } from "../Components/Toast/message";

const AuthContext = createContext(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("`useAuth` must be used within an `AuthProvider`");
  }
  return context;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  /**
   * Initialize auth state from session
   */
  useEffect(() => {
    // Skip auth initialization if Supabase is not configured
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Fetch user profile from database
   */
  const fetchUserProfile = useCallback(async (userId) => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase.from("user_profiles").select("*").eq("id", userId).single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  }, []);

  /**
   * Sign up with email and password
   */
  const signUp = useCallback(async (email, password, metadata = {}) => {
    if (!supabase) {
      message.error("Authentication is not configured. Please set up environment variables.");
      return { success: false, error: "Supabase not configured" };
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        message.error(error.message);
        return { success: false, error: error.message };
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        message.info("Please check your email to confirm your account");
      } else {
        message.success("Account created successfully!");
      }

      return { success: true, user: data.user };
    } catch (error) {
      message.error("An unexpected error occurred");
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sign in with email and password
   */
  const signIn = useCallback(async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        message.error(error.message);
        return { success: false, error: error.message };
      }

      message.success("Signed in successfully!");
      return { success: true, user: data.user, session: data.session };
    } catch (error) {
      message.error("An unexpected error occurred");
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sign in with OAuth provider (Google, GitHub, etc.)
   */
  const signInWithOAuth = useCallback(async (provider) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        message.error(error.message);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      message.error("An unexpected error occurred");
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sign out
   */
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();

      if (error) {
        message.error(error.message);
        return { success: false, error: error.message };
      }

      message.success("Signed out successfully");
      return { success: true };
    } catch (error) {
      message.error("An unexpected error occurred");
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Send password reset email
   */
  const resetPassword = useCallback(async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        message.error(error.message);
        return { success: false, error: error.message };
      }

      message.success("Password reset email sent! Check your inbox.");
      return { success: true };
    } catch (error) {
      message.error("An unexpected error occurred");
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * Update password (when signed in)
   */
  const updatePassword = useCallback(async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        message.error(error.message);
        return { success: false, error: error.message };
      }

      message.success("Password updated successfully");
      return { success: true };
    } catch (error) {
      message.error("An unexpected error occurred");
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * Update user metadata
   */
  const updateUserMetadata = useCallback(async (metadata) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: metadata,
      });

      if (error) {
        message.error(error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // =====================================================
  // Two-Factor Authentication (2FA/MFA) Methods
  // =====================================================

  /**
   * Enroll in 2FA (TOTP)
   * Returns QR code data for user to scan with authenticator app
   */
  const enroll2FA = useCallback(async () => {
    try {
      // First, clean up any existing unverified factors to prevent name conflicts
      // Get user to access factors directly (more reliable than listFactors)
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (currentUser?.factors) {
        for (const factor of currentUser.factors) {
          if (factor.factor_type === "totp" && factor.status === "unverified") {
            await supabase.auth.mfa.unenroll({ factorId: factor.id });
          }
        }
      }

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Authenticator App",
      });

      // Handle name conflict by removing conflicting factor and retrying
      const isNameConflict = error?.code === "mfa_factor_name_conflict" || error?.message?.includes("friendly name");
      if (isNameConflict) {
        // Force cleanup - refetch user and remove all unverified factors
        const {
          data: { user: refreshedUser },
        } = await supabase.auth.getUser();
        if (refreshedUser?.factors) {
          for (const factor of refreshedUser.factors) {
            if (factor.factor_type === "totp" && factor.status === "unverified") {
              await supabase.auth.mfa.unenroll({ factorId: factor.id });
            }
          }
        }
        // Retry enrollment
        const retryResult = await supabase.auth.mfa.enroll({
          factorType: "totp",
          friendlyName: "Authenticator App",
        });
        if (retryResult.error) {
          message.error(retryResult.error.message);
          return { success: false, error: retryResult.error.message };
        }
        return {
          success: true,
          factorId: retryResult.data.id,
          qrCode: retryResult.data.totp.qr_code,
          secret: retryResult.data.totp.secret,
          uri: retryResult.data.totp.uri,
        };
      }

      if (error) {
        message.error(error.message);
        return { success: false, error: error.message };
      }

      // data contains: id, type, totp: { qr_code, secret, uri }
      return {
        success: true,
        factorId: data.id,
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
        uri: data.totp.uri,
      };
    } catch (error) {
      message.error("Failed to enroll in 2FA");
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * Verify 2FA enrollment code
   */
  const verify2FAEnrollment = useCallback(async (factorId, code) => {
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) throw challenge.error;

      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code,
      });

      if (verify.error) {
        message.error("Invalid verification code");
        return { success: false, error: verify.error.message };
      }

      message.success("2FA enabled successfully!");
      return { success: true };
    } catch (error) {
      message.error("Failed to verify 2FA code");
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * Challenge 2FA (during login)
   */
  const challenge2FA = useCallback(async (factorId) => {
    try {
      const { data, error } = await supabase.auth.mfa.challenge({ factorId });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, challengeId: data.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * Verify 2FA code (during login)
   */
  const verify2FA = useCallback(async (factorId, challengeId, code) => {
    try {
      const { data, error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code,
      });

      if (error) {
        message.error("Invalid 2FA code");
        return { success: false, error: error.message };
      }

      message.success("2FA verification successful!");
      return { success: true, session: data };
    } catch (error) {
      message.error("Failed to verify 2FA code");
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * Unenroll from 2FA
   */
  const unenroll2FA = useCallback(async (factorId) => {
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });

      if (error) {
        message.error(error.message);
        return { success: false, error: error.message };
      }

      message.success("2FA disabled successfully");
      return { success: true };
    } catch (error) {
      message.error("Failed to disable 2FA");
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * Get list of enrolled factors
   * Uses getUser() for more reliable factor retrieval than mfa.listFactors()
   */
  const getFactors = useCallback(async () => {
    if (!supabase) return { success: false, error: "Supabase not configured" };

    try {
      const {
        data: { user: currentUser },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        return { success: false, error: error.message };
      }

      if (!currentUser?.factors) {
        return { success: true, factors: [], totpFactors: [] };
      }

      const allFactors = currentUser.factors;
      // Only return verified TOTP factors for 2FA prompts
      const totpFactors = allFactors.filter((f) => f.factor_type === "totp" && f.status === "verified");

      return {
        success: true,
        factors: allFactors,
        totpFactors,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  const value = {
    user,
    session,
    profile,
    loading,
    isAuthenticated: !!user,
    // Auth methods
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    resetPassword,
    updatePassword,
    updateUserMetadata,
    // Profile management
    fetchUserProfile,
    // 2FA methods
    enroll2FA,
    verify2FAEnrollment,
    challenge2FA,
    verify2FA,
    unenroll2FA,
    getFactors,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default useAuth;
