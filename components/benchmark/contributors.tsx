import { Separator } from "@/components/ui/separator";

interface ContributorsProps {
  contributors: string[];
}

/** Displays a row of GitHub contributor avatars at the end of a benchmark page. */
export function Contributors({ contributors }: ContributorsProps) {
  if (!contributors || contributors.length === 0) return null;

  return (
    <div className="mt-12">
      <Separator />

      <div className="mt-8 flex flex-col items-center gap-4">
        <p className="text-sm text-muted-foreground">
          Contributors
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          {contributors.map((username) => (
            <a
              key={username}
              href={`https://github.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col items-center gap-1.5"
            >
              {/* Avatar */}
              <div className="relative overflow-hidden rounded-full ring-2 ring-transparent transition-all duration-200 ease-out group-hover:ring-primary/40 group-hover:shadow-[0_0_12px_rgba(var(--primary-rgb,99,102,241),0.25)]">
                <img
                  src={`https://github.com/${username}.png`}
                  alt={username}
                  width={48}
                  height={48}
                  loading="lazy"
                  className="h-12 w-12 rounded-full object-cover transition-transform duration-200 ease-out group-hover:scale-110"
                />
              </div>

              {/* Username tooltip */}
              <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-popover px-2 py-0.5 text-xs font-medium text-popover-foreground shadow-md border opacity-0 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:-bottom-8">
                {username}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
