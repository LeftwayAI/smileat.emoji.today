"use client";

import Image from 'next/image';
import { useEffect, useState, useCallback } from "react";
import { useSession, getCsrfToken, signIn } from "next-auth/react";
import sdk from "@farcaster/miniapp-sdk";
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { useUnifiedUser } from "@/hooks/useUnifiedUser";

export default function SimpleHomePage() {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isMiniApp, setIsMiniApp] = useState<boolean | null>(null);
  const { data: session, status, update } = useSession();
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const unifiedUser = useUnifiedUser();

  const isAuthenticated = Boolean(
    session?.user?.fid || (session?.user as any)?.walletAddress
  );

  // Debug session changes
  useEffect(() => {
    console.log('Session state:', {
      status,
      session,
      isAuthenticated,
      unifiedUser,
      fid: session?.user?.fid,
      walletAddress: (session?.user as any)?.walletAddress
    });
  }, [session, status, isAuthenticated, unifiedUser]);

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  // Check if we're in a mini app and notify when ready
  useEffect(() => {
    const initializeMiniApp = async () => {
      try {
        const inMiniApp = await sdk.isInMiniApp();
        setIsMiniApp(inMiniApp);
        console.log('In mini app:', inMiniApp);
        
        if (inMiniApp) {
          await sdk.actions.ready();
          console.log('Mini app ready signal sent');
        }
      } catch (error) {
        console.error('Error initializing mini app:', error);
        setIsMiniApp(false);
      }
    };
    initializeMiniApp();
  }, []);

  const getNonce = useCallback(async () => {
    const nonce = await getCsrfToken();
    if (!nonce) throw new Error("Unable to generate nonce");
    return nonce;
  }, []);

  const handleSignIn = useCallback(async () => {
    console.log('handleSignIn called, isMiniApp:', isMiniApp);
    
    // Use the already detected isMiniApp state
    if (!isMiniApp) {
      // Not in Farcaster Mini App, open in Farcaster
      window.open("https://farcaster.xyz/miniapps/c_Y960s6FSE2/emojitoday", "_blank");
      return;
    }

    try {
      setIsSigningIn(true);
      console.log('Getting nonce...');
      const nonce = await getNonce();
      console.log('Nonce obtained:', nonce);
      
      console.log('Calling sdk.actions.signIn...');
      const result = await sdk.actions.signIn({ nonce });
      console.log('Sign in result:', result);

      // Try Farcaster auth first
      console.log('Attempting Farcaster auth...');
      const res = await signIn("credentials", {
        message: result.message,
        signature: result.signature,
        redirect: false,
        acceptAuthAddress: true,
      });
      
      console.log('Farcaster auth response:', res);
      
      if (!res || (res as any).error || (res as any).ok === false) {
        console.log('Farcaster auth failed, trying wallet auth...');
        const walletRes = await signIn("wallet", {
          message: result.message,
          signature: result.signature,
          redirect: false,
          acceptAuthAddress: true,
        });
        console.log('Wallet auth response:', walletRes);
      }

      // Refresh NextAuth client session
      console.log('Updating session...');
      await update();
      console.log('Session updated');
    } catch (e) {
      console.error('Sign in error:', e);
      alert('Sign in failed. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  }, [getNonce, update, isMiniApp]);

  // Show loading only while detecting mini app status
  if (isMiniApp === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050505]">
        <Image
          src="/images/logo-white.svg"
          alt="Loading"
          width={48}
          height={48}
          className="animate-spin"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-between text-white bg-[#050505] pt-4 sm:pt-10 md:pt-12 lg:pt-16">
      {/* Main Content Area */}
      <main className="flex flex-col items-center justify-center flex-grow w-full container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">

        {/* Logo */}
        <div className="mb-12">
          <Image
            src="/images/logo-white.svg"
            alt="Logo"
            width={120}
            height={120}
            priority
          />
        </div>

        {/* Title */}
        <div className="text-center w-full mb-12">
          <h1 className="text-4xl font-light tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl leading-tight mb-4">
            Minikit Template
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl text-neutral-400 leading-tight font-light">
            A simple Farcaster mini app boilerplate
          </p>
        </div>

        {/* Auth Status */}
        {isAuthenticated && (
          <div className="mb-8 p-4 bg-neutral-900 rounded-lg">
            <p className="text-sm text-neutral-400 mb-2">Signed in as:</p>
            <p className="text-lg font-mono">
              {context?.user?.username || unifiedUser.username || session?.user?.name || 'User'}
            </p>
            {(context?.user?.fid || unifiedUser.fid || session?.user?.fid) && (
              <p className="text-sm text-neutral-500 mt-1">
                FID: {context?.user?.fid || unifiedUser.fid || session?.user?.fid}
              </p>
            )}
          </div>
        )}

        {/* Sign In Button */}
        {!isAuthenticated && (
          <button
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="flex items-center justify-center py-4 px-8 sm:py-5 sm:px-12 rounded-full text-xl bg-white text-black transition-all duration-300 hover:bg-neutral-200 disabled:opacity-50"
          >
            {isSigningIn ? (
              <Image
                src="/images/logo-white.svg"
                alt="Loading"
                width={24}
                height={24}
                className="animate-spin invert"
              />
            ) : (
              <div className="flex items-center gap-3">
                <img
                  src="/images/farcaster-white.svg"
                  alt="Farcaster"
                  className="h-5 w-5 invert"
                />
                <span>
                  {isMiniApp ? 'Sign in with Farcaster' : 'Open in Farcaster'}
                </span>
              </div>
            )}
          </button>
        )}

        {/* Debug info (remove in production) */}
        <div className="mt-8 p-4 bg-neutral-900 rounded-lg text-xs font-mono text-neutral-400">
          <p>Debug Info:</p>
          <p>In Mini App: {String(isMiniApp)}</p>
          <p>Frame Ready: {String(isFrameReady)}</p>
          <p>Auth Status: {status}</p>
          <p>Is Authenticated: {String(isAuthenticated)}</p>
        </div>

        {/* Terms */}
        {!isAuthenticated && (
          <p className="text-xs text-neutral-600 text-center mt-4 font-mono">
            By signing in, you accept our{" "}
            <a href="/terms-and-conditions" className="text-neutral-500 hover:text-neutral-400 hover:underline transition-colors">
              Terms and Conditions
            </a>
          </p>
        )}
      </main>

      {/* Footer */}
      <footer className="flex flex-col items-center justify-center w-full pt-4 pb-6 md:py-6">
        <div className="flex space-x-6 md:space-x-4 items-center">
          <a href="https://farcaster.xyz" target="_blank" rel="noopener noreferrer">
            <img src="/images/farcaster-white.svg" alt="Farcaster" className="h-[18px] w-auto opacity-70 hover:opacity-100 transition-opacity" />
          </a>
          <span className="text-neutral-700">•</span>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-neutral-600 hover:text-neutral-400 transition-colors text-sm font-mono">
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}