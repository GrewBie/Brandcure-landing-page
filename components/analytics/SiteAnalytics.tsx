import { GaRouteTracker } from "@/components/analytics/GaRouteTracker";
import {
  getClarityProjectId,
  getGaMeasurementId,
} from "@/lib/analytics/env";
import Script from "next/script";
import { Suspense } from "react";

/**
 * Loads Google Analytics 4 and Microsoft Clarity when env vars are set.
 * Set NEXT_PUBLIC_GA_MEASUREMENT_ID and NEXT_PUBLIC_CLARITY_PROJECT_ID in Vercel.
 */
export function SiteAnalytics() {
  const gaId = getGaMeasurementId();
  const clarityId = getClarityProjectId();

  if (!gaId && !clarityId) return null;

  return (
    <>
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `}
          </Script>
          <Suspense fallback={null}>
            <GaRouteTracker measurementId={gaId} />
          </Suspense>
        </>
      )}

      {clarityId && (
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${clarityId}");
          `}
        </Script>
      )}
    </>
  );
}
