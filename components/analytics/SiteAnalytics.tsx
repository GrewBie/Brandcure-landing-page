import { GaRouteTracker } from "@/components/analytics/GaRouteTracker";
import {
  getClarityProjectId,
  getGaMeasurementId,
} from "@/lib/analytics/env";
import Script from "next/script";
import { Suspense } from "react";

/**
 * Loads GA4 and Clarity after load — keeps third-party scripts off the critical path.
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
            strategy="lazyOnload"
          />
          <Script id="ga4-init" strategy="lazyOnload">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', {
                anonymize_ip: true,
                allow_google_signals: false,
                allow_ad_personalization_signals: false,
                client_storage: 'none'
              });
            `}
          </Script>
          <Suspense fallback={null}>
            <GaRouteTracker measurementId={gaId} />
          </Suspense>
        </>
      )}

      {clarityId && (
        <Script id="microsoft-clarity" strategy="lazyOnload">
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
