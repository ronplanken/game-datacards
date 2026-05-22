import { render, screen } from "@testing-library/react";
import React from "react";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { NotFound } from "../NotFound";
import { RouteErrorBoundary } from "../RouteErrorBoundary";

describe("NotFound", () => {
  it("renders a branded 404 with a link home", () => {
    const router = createMemoryRouter(
      [
        { path: "/", element: <div>home</div> },
        { path: "*", element: <NotFound /> },
      ],
      { initialEntries: ["/does-not-exist"] },
    );
    render(<RouterProvider router={router} />);

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Page not found")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /back to game datacards/i });
    expect(link).toHaveAttribute("href", "/");
  });
});

describe("RouteErrorBoundary", () => {
  const renderWithError = (loader) => {
    const router = createMemoryRouter(
      [
        {
          path: "/",
          element: <div>ok</div>,
          loader,
          errorElement: <RouteErrorBoundary />,
        },
      ],
      { initialEntries: ["/"] },
    );
    return render(<RouterProvider router={router} />);
  };

  it("shows a generic error page when a route throws", async () => {
    const router = createMemoryRouter(
      [
        {
          path: "/",
          element: <ThrowingComponent />,
          errorElement: <RouteErrorBoundary />,
        },
      ],
      { initialEntries: ["/"] },
    );
    render(<RouterProvider router={router} />);

    expect(await screen.findByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText(/boom/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reload page/i })).toBeInTheDocument();
  });

  it("falls through to the 404 page for a thrown 404 response", async () => {
    renderWithError(() => {
      throw new Response("Not Found", { status: 404 });
    });

    expect(await screen.findByText("Page not found")).toBeInTheDocument();
    expect(screen.getByText("404")).toBeInTheDocument();
  });
});

const ThrowingComponent = () => {
  throw new Error("boom");
};
