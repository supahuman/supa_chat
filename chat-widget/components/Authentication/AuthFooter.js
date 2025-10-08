'use client';

import Link from 'next/link';

const AuthFooter = ({ loginText = "Already have an account?", loginLink = "/login", supportText = "Need help?", supportLink = "/support" }) => {
  return (
    <div className="text-center space-y-2">
      <p className="text-sm text-gray-600">
        {loginText}{' '}
        <Link href={loginLink} className="text-blue-600 hover:text-blue-500">
          Log in here
        </Link>
      </p>
      <p className="text-sm text-gray-500">
        {supportText}{' '}
        <Link href={supportLink} className="text-blue-600 hover:text-blue-500">
          Chat with support 👉
        </Link>
      </p>
    </div>
  );
};

export default AuthFooter;
