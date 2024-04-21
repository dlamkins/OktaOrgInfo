import React from 'react';

const Footer = () => (
    <footer className="bg-gray-100 dark:bg-gray-900">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            <p className="mx-auto mt-6 text-center leading-relaxed text-gray-500 dark:text-gray-400">
                This utility operates entirely in your browser, meaning it does not have a backend server. All queries and operations are processed locally on your device. We do not collect, store, or transmit any of the data you submit or generate while using this site.
            </p>

            <p className="mx-auto mt-6 text-center leading-relaxed text-gray-500 dark:text-gray-400">
                This website and the utility provided here is not affiliated with, endorsed by, or associated with Okta, Inc. in any way.
            </p>

            <ul className="mt-12 flex justify-center gap-6 md:gap-8">
                <li>
                    <a href="#" rel="noreferrer" target="_blank" className="text-gray-700 transition hover:text-gray-700/75 dark:text-white dark:hover:text-white/75">
                        <span>View the Source on GitHub</span>
                    </a>
                </li>
            </ul>
        </div>
    </footer>
);

export default Footer;