import Link from "next/link";
import { Heart, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

const XIcon = ({ className }: { className?: string }) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="currentColor"
  >
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

export function Footer() {
  return (
    <footer className="border-t py-6">
      <div className="container flex flex-col items-center justify-center gap-2 px-4 md:px-8 max-w-screen-2xl mx-auto text-center">
        <p className="text-sm text-muted-foreground">
          Made with <Heart className="inline h-4 w-4 text-red-500 fill-red-500 align-text-bottom" /> by{" "}
          <Link
            href="https://mjw.dev"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-primary link-underline"
          >
            Marvin Wendt
          </Link>{" "}
          and{" "}
          <Link
            href="https://github.com/MarvinJWendt/gobench.dev/graphs/contributors"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-primary link-underline"
          >
            contributors
          </Link>
        </p>
        <div className="flex gap-2 justify-center items-center">
          <Button variant="ghost" size="icon" asChild>
            <Link
              href="https://github.com/MarvinJWendt"
              target="_blank"
              rel="noreferrer"
            >
              <Github className="size-4" />
              <span className="sr-only">GitHub</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link
              href="https://x.com/MarvinJWendt"
              target="_blank"
              rel="noreferrer"
            >
              <XIcon className="size-3.5" />
              <span className="sr-only">X (formerly Twitter)</span>
            </Link>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground/60 max-w-[600px] mt-2">
          gobench.dev is not affiliated with, funded by, or associated with the Go team or Google.
        </p>
        <p className="text-xs text-muted-foreground/60 max-w-[600px]">
          Website content is licensed under{" "}
          <Link
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noreferrer"
            className="link-underline"
          >
            Creative Commons Attribution 4.0 International
          </Link>
        </p>
        <Link
          href="https://creativecommons.org/licenses/by/4.0/"
          target="_blank"
          rel="noreferrer"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://i.creativecommons.org/l/by/4.0/88x31.png"
            alt="Creative Commons Attribution 4.0 International License"
            width={88}
            height={31}
          />
        </Link>
      </div>
    </footer>
  );
}
