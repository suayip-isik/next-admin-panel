import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AvatarManagementCard } from "@/shared/components/avatar-management-card";

describe("AvatarManagementCard", () => {
  const baseProps = {
    title: "Profile photo",
    description: "Upload your avatar",
    imageUrl: null,
    imageVersion: null,
    fallback: "SA",
    displayName: null,
    uploadLabel: "Upload",
    removeLabel: "Remove",
    uploadedLabel: "Uploaded",
    emptyLabel: "No avatar uploaded",
    onUpload: vi.fn(),
    onRemove: vi.fn(),
  };

  it("does not render initials as the file name when there is no avatar", () => {
    render(<AvatarManagementCard {...baseProps} />);

    expect(screen.getByText("SA")).toBeInTheDocument();
    expect(screen.queryByText("SA", { selector: "p" })).not.toBeInTheDocument();
    expect(screen.getByText("No avatar uploaded")).toBeInTheDocument();
  });

  it("keeps the avatar fallback visible until the image loads", () => {
    render(
      <AvatarManagementCard
        {...baseProps}
        imageUrl="https://cdn.example.com/avatar.png?v=1"
        imageVersion={1}
      />,
    );

    expect(screen.getByText("SA")).toBeInTheDocument();
    expect(screen.getByText("Uploaded")).toBeInTheDocument();
  });

  it("shows the selected file name while upload is pending", () => {
    const onUpload = vi.fn();
    render(<AvatarManagementCard {...baseProps} onUpload={onUpload} />);

    const input = document.querySelector('input[type="file"]');
    expect(input).not.toBeNull();

    fireEvent.change(input as HTMLInputElement, {
      target: {
        files: [new File(["avatar"], "avatar.png", { type: "image/png" })],
      },
    });

    expect(onUpload).toHaveBeenCalledTimes(1);
    expect(screen.getByText("avatar.png")).toBeInTheDocument();
  });

  it("clears the transient file name when the avatar is removed", () => {
    const { rerender } = render(<AvatarManagementCard {...baseProps} />);

    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input as HTMLInputElement, {
      target: {
        files: [new File(["avatar"], "avatar.png", { type: "image/png" })],
      },
    });

    expect(screen.getByText("avatar.png")).toBeInTheDocument();

    rerender(
      <AvatarManagementCard
        {...baseProps}
        imageUrl="https://cdn.example.com/avatar.png?v=1"
        imageVersion={1}
      />,
    );

    expect(screen.queryByText("avatar.png")).not.toBeInTheDocument();

    rerender(<AvatarManagementCard {...baseProps} imageUrl={null} />);

    expect(screen.getByText("SA")).toBeInTheDocument();
    expect(screen.queryByText("avatar.png")).not.toBeInTheDocument();
    expect(screen.getByText("No avatar uploaded")).toBeInTheDocument();
  });
});
