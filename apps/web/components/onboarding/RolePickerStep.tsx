"use client";

import React, { ComponentType } from 'react';
import { Check, User, BookOpen, Briefcase, LucideProps } from 'lucide-react';
import { RoleId, RoleOption } from './types';

const ROLES: RoleOption[] = [
  {
    id: 'learner',
    title: 'Learner',
    description: 'Access course materials, complete assignments, and track your learning progress.',
    icon: BookOpen,
  },
  {
    id: 'instructor',
    title: 'Instructor',
    description: 'Create learning content, manage your virtual classes, and grade student submissions.',
    icon: User,
  },
  {
    id: 'organization',
    title: 'Organization',
    description: 'Manage multiple teams, view advanced analytics, and control billing settings.',
    icon: Briefcase,
  },
];

interface RolePickerStepProps {
  selectedRole: RoleId | null;
  onSelectRole: (role: RoleId) => void;
  onNext: () => void;
}

export default function RolePickerStep({
  selectedRole,
  onSelectRole,
  onNext,
}: RolePickerStepProps): React.JSX.Element {
  return (
    <div className="w-full max-w-2xl rounded-[2rem] border border-white/5 bg-[#0a0a0a] p-8 shadow-[0_0_40px_rgba(251,191,36,0.08)]">
      {/* Header */}
      <div className="mb-8 text-center">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
          Step 2 of 4
        </span>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl" style={{ fontFamily: 'CalSans, Inter, sans-serif' }}>
          Choose your account type
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          We&apos;ll customize your dashboard experience based on your selection.
        </p>
      </div>

      {/* Roles */}
      <div className="space-y-4">
        {ROLES.map((role) => {
          const Icon: ComponentType<LucideProps> = role.icon;
          const isSelected = selectedRole === role.id;

          return (
            <button
              key={role.id}
              onClick={() => onSelectRole(role.id)}
              type="button"
              className={`relative flex w-full items-start gap-4 rounded-2xl border p-5 text-left transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-black ${
                isSelected
                  ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)] -translate-y-0.5'
                  : 'border-white/5 bg-zinc-900/40 hover:border-white/10 hover:shadow-sm hover:bg-zinc-900/60'
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-300 ${
                  isSelected ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>

              <div className="flex-1 pr-6">
                <h3 className="font-semibold text-white">{role.title}</h3>
                <p className="mt-1 text-sm leading-normal text-zinc-400">{role.description}</p>
              </div>

              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500 text-black scale-110'
                    : 'border-zinc-700 bg-transparent'
                }`}
              >
                {isSelected && <Check className="h-3 w-3" />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={onNext}
          disabled={!selectedRole}
          className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-200 ${
            selectedRole
              ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.2)] cursor-pointer active:scale-[0.98]'
              : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
