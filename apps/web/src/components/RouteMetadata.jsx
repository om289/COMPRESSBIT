import React from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://www.compressbit.com';

const RouteMetadata = () => {
  const { pathname } = useLocation();
  const canonicalPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');

  return (
    <Helmet>
      <link rel="canonical" href={`${SITE_URL}${canonicalPath}`} />
    </Helmet>
  );
};

export default RouteMetadata;
