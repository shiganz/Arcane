import Image from "next/image";

type ArcaneLogoProps = {
  size?: number;
  subtitle?: string;
};

export function ArcaneLogo({ size = 40, subtitle }: ArcaneLogoProps) {
  return (
    <div className="flex items-center gap-3">
      <Image
        src="/logo.png"
        alt="Arcane"
        width={size}
        height={size}
        className="rounded-lg object-contain"
        priority
      />
      <div>
        <span className="text-lg font-semibold leading-tight text-white">
          Arcane
        </span>
        {subtitle && (
          <p className="text-sm font-medium leading-tight text-orange-400">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
