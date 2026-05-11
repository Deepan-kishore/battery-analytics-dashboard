import { NextRequest, NextResponse } from 'next/server';

const CMS_DOMAIN = 'my-web-app--project-1087982776454717284.asia-southeast1.hosted.app';
const CMS_API_URL = 'https://dev-api.topgeo.ai';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname === '/insights' || pathname.startsWith('/insights/')) {
    try {
      let slug = pathname.replace(/^\/insights\/?/, '');
      slug = slug ? '/' + slug : '';
      const cmsUrl = `${CMS_API_URL}/cms/render/${CMS_DOMAIN}${slug}`;
      const cmsResponse = await fetch(cmsUrl, {
        headers: {
          'Accept': 'text/html',
          'User-Agent': 'Aspora-CMS-Client/1.0',
        },
      });

      console.log("inside middlewarte", pathname,  cmsResponse);
      
      if (cmsResponse.ok) {
        const html = await cmsResponse.text();
        return new NextResponse(html, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=60, s-maxage=300',
            'X-Served-By': 'aspora-cms-middleware',
          },
        });
      }
    } catch {}
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Exclude api routes, static files, and other special routes
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
