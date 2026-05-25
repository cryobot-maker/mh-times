"use client";

import { Modal } from "@/components/Modal";
import { useSettingsStore } from "@/lib/stores/settingsStore";
import { cn } from "@/lib/utils";

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 border-b border-[#e2e2e2] py-4 last:border-0">
      <div>
        <span className="text-sm font-bold text-[#121212]">{label}</span>
        {description && (
          <p className="mt-0.5 text-xs text-[#6b6b6b]">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-[#6aaa64]" : "bg-[#d3d6da]"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </button>
    </label>
  );
}

export function SettingsModal({
  open,
  onClose,
  showHardMode = false,
}: {
  open: boolean;
  onClose: () => void;
  showHardMode?: boolean;
}) {
  const {
    darkMode,
    hardMode,
    colorBlindMode,
    toggleDarkMode,
    toggleHardMode,
    toggleColorBlindMode,
  } = useSettingsStore();

  return (
    <Modal open={open} onClose={onClose}>
      <h2
        className="mb-4 pr-8 text-2xl font-bold text-[#121212]"
        style={{ fontFamily: "var(--font-karnak)" }}
      >
        Settings
      </h2>
      <div>
        <ToggleRow
          label="Dark Mode"
          description="Label only — theme not applied yet"
          checked={darkMode}
          onChange={toggleDarkMode}
        />
        {showHardMode && (
          <ToggleRow
            label="Hard Mode"
            description="Any revealed hints must be used in later guesses"
            checked={hardMode}
            onChange={toggleHardMode}
          />
        )}
        <ToggleRow
          label="Color Blind Mode"
          description="Uses orange and blue instead of green and yellow"
          checked={colorBlindMode}
          onChange={toggleColorBlindMode}
        />
      </div>
    </Modal>
  );
}
