import { CheckCircle } from "lucide-react";

export const StepComplete = () => {
  return (
    <div className="mww-complete">
      <div className="mww-complete-icon">
        <CheckCircle />
      </div>

      <h1 className="mww-complete-title">You&apos;re All Set!</h1>

      <p className="mww-complete-text">
        Start browsing your datacards. You can change your game system or preferences anytime from the menu.
      </p>

      <a href="https://discord.gg/anfn4qTYC4" target="_blank" rel="noreferrer" className="mww-complete-discord">
        <img
          src="https://discordapp.com/api/guilds/997166169540788244/widget.png?style=banner2"
          alt="Join our Discord"
        />
      </a>
    </div>
  );
};
