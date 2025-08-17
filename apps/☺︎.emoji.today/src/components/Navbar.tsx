"use client";

import { useSession, signOut } from "next-auth/react";
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { getCurrentVotingDay, formatDateForDB } from "@/lib/date-utils";
import { clearSessionAndSignOut } from "./AuthWrapper";

export function Navbar() {
  const { data: session } = useSession();
  const { context } = useMiniKit();
  const router = useRouter();
  const pathname = usePathname();
  const [imageError, setImageError] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const username = context?.user?.username || `FID ${session?.user?.fid}`;
  const profileImage = context?.user?.pfpUrl;
  const isHomePage = pathname === "/";

  // Get initials from username
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setShowComingSoon(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  if (!session?.user) {
    // Unauthenticated state: centered logo only
    return (
      <nav
        className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-sm transition-all duration-200 flex justify-center items-center py-4"
      >
        <Link href="/" className="opacity-80 hover:opacity-100 transition-opacity">
          <Image
            src="/images/logo-white.svg"
            alt="☺︎.emoji.today"
            width={48}
            height={48}
            className="w-[28px] h-[28px] sm:w-[48px] sm:h-[48px]"
          />
        </Link>
      </nav>
    );
  }

  // Authenticated state: logo on left, countdown centered, profile on right
  return (
    <nav
      className="fixed top-0 sm:top-10 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-sm transition-all duration-200"
    >
      <div className="px-4 sm:px-8 lg:px-10 py-4 sm:py-5">
        <div className="flex justify-between items-center">
          {/* Logo with text - Left Side */}
          <Link href="/" className="flex items-center gap-1.5">
            <Image
              src="/images/logo-white.svg"
              alt="☺︎.emoji.today"
              width={24}
              height={24}
              className="w-[24px] h-[24px] sm:w-[48px] sm:h-[48px]"
            />
            {/* <span className="text-white text-sm sm:text-xl font-light">
              emoji<span className="text-neutral-500">.today</span>
            </span> */}
          </Link>

          {/* Profile Section - Right Side */}
          <div className="flex items-center relative" ref={dropdownRef}>
            {/* Profile Picture with Dropdown */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="focus:outline-none rounded-full"
            >
              {profileImage && !imageError ? (
                <img
                  className="w-[24px] h-[24px] sm:w-[48px] sm:h-[48px] block rounded-full object-cover"
                  src={profileImage}
                  alt={username}
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-[24px] h-[24px] sm:w-[48px] sm:h-[48px] rounded-full bg-orange-500 flex items-center justify-center text-white text-xs sm:text-sm font-medium">
                  {getInitials(username)}
                </div>
              )}
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-md shadow-lg bg-black/90 backdrop-blur-md ring-1 ring-white/10 max-w-[calc(100vw-2rem)] sm:max-w-none">
                <div className="py-1">
                  {/* Welcome text in dropdown */}
                  <div className="px-4 py-2 text-sm text-neutral-400 border-b border-neutral-700">
                    {username} is here!
                  </div>


                  {/* FAQ option */}
                  <button
                    onClick={() => {
                      setShowComingSoon(true);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-white/10 transition-colors"
                  >
                    FAQ{" "}
                    <span
                      className={`text-neutral-500 transition-opacity duration-300 ${showComingSoon ? 'opacity-100' : 'opacity-0'
                        }`}
                    >
                      (coming soon)
                    </span>
                  </button>

                  {/* About option */}
                  <button
                    onClick={() => {
                      setShowComingSoon(true);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-white/10 transition-colors"
                  >
                    About{" "}
                    <span
                      className={`text-neutral-500 transition-opacity duration-300 ${showComingSoon ? 'opacity-100' : 'opacity-0'
                        }`}
                    >
                      (coming soon)
                    </span>
                  </button>

                  {/* Log out */}
                  <button
                    onClick={async () => {
                      setIsMenuOpen(false);
                      try {
                        // Use enhanced logout that clears all session data
                        await clearSessionAndSignOut();
                      } catch (error) {
                        console.error('Logout error:', error);
                        // Force reload as fallback
                        window.location.href = '/';
                      }
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-white/10 transition-colors border-t border-neutral-700"
                  >
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
