import React, { useState, useRef } from 'react';
import Footer from './Footer';

const copyToClipboard = (text) => {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
};

const normalizeDomain = (domain) => {
  if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
    domain = `https://${domain}`;
  }

  return `${domain}/.well-known/okta-organization`;
};

const autoCompleteDomain = (input) => {
  const possibleEndings = ['.okta.com', '.oktapreview.com', '.okta-emea.com'];

  if (input.length > 0) {
    if (!input.includes('.')) {
      return possibleEndings[0]; // default to hint *.okta.com
    } else {
      const lowerInput = input.toLowerCase();
      const userEnding = lowerInput.substring(lowerInput.indexOf('.'));

      for (const ending of possibleEndings) {
        if (ending.startsWith(userEnding)) {
          return ending.substring(userEnding.length);
        }
      }
    }
  }

  return '';
};

const App = () => {
  const [domain, setDomain] = useState('');
  const [orgInfo, setOrgInfo] = useState(null);
  const [error, setError] = useState(null);
  const [hint, setHint] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const submitButton = useRef();

  const handleInputChange = (e) => {
    let cleanValue = e.target.value.replace(" ", "");
    setDomain(cleanValue);
    setHint(autoCompleteDomain(cleanValue));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      submitButton.current.click();
    } else if (e.key === 'Tab') {
      e.preventDefault();

      setDomain(domain + hint);
      setHint('')
    }
  };

  const fetchJSON = async () => {
    if (!domain) return;

    setLoading(true);

    // We force the hint when they submit.
    const normalizedDomain = normalizeDomain(domain + hint);
    setDomain(domain + hint);
    setHint('');

    try {
      const response = await fetch(normalizedDomain);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
      const data = await response.json();
      setOrgInfo(data);
      setError(null);
    } catch (err) {
      setError(`Error: ${err.message}`);
      setOrgInfo(null);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-lg">
            <h1 className="text-center text-2xl font-bold text-indigo-600 sm:text-3xl">OktaOrgInfo</h1>

            <p className="mx-auto mt-4 max-w-md text-center text-gray-500">
              This tool will pull the OrgId, cell name, OIE vs. Classic, and more about the provided Okta tenant.
            </p>

            <div className="mb-0 mt-6 space-y-4 rounded-lg p-4 shadow-lg sm:p-6 lg:p-8">
              <p className="text-center text-lg font-medium">Enter your Okta Domain:</p>

              <div>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                    placeholder="Enter domain"
                    tabIndex="0"
                    autoFocus={true}
                    value={domain}
                    onFocus={(e) => e.target.select()}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                  />
                  {hint && (
                    <label className="absolute top-0 left-0 px-4 py-4 text-sm pointer-events-none whitespace-nowrap">
                      <span style={{ color: 'transparent' }}>{domain}</span>
                      <span style={{ color: 'gray' }}>{hint}</span>
                      <span style={{ opacity: '0.7' }} className="ml-12">Press <span className="whitespace-nowrap rounded-full bg-indigo-100 px-2.5 py-0.5 text-sm text-indigo-700">TAB</span> to autocomplete</span>
                    </label>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="block w-full rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white"
                onClick={fetchJSON}
                ref={submitButton}
                disabled={loading}
              >
                {loading ? ("Loading...") : ("Get Info")}
              </button>
            </div>

            {error && (
              <div className="mb-0 mt-6 space-y-4 rounded-lg p-4 shadow-lg sm:p-6 lg:p-8">
                <p className="text-red-500">{error}</p>
              </div>
            )}

            {orgInfo && (
              <div>
                <div className="mb-0 mt-6 space-y-4 rounded-lg p-4 shadow-lg sm:p-6 lg:p-8">
                  {!showRaw ?
                    (<div className="flow-root">
                      <dl className="-my-3 divide-y divide-gray-100 text-sm">
                        <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
                          <dt className="font-medium text-gray-900">OrgID</dt>
                          <dd className="text-gray-700 sm:col-span-2">
                          <label>{orgInfo.id}</label>
                            <button
                              onClick={() => copyToClipboard(orgInfo.id)}
                              className="whitespace-nowrap rounded-full bg-indigo-100 px-2.5 py-0.5 text-sm text-indigo-700 float-right">Copy</button>
                          </dd>
                        </div>

                        <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
                          <dt className="font-medium text-gray-900">OrgType</dt>
                          <dd className="text-gray-700 sm:col-span-2">
                            <label>{orgInfo.pipeline === 'idx' ? 'OIE' : 'Classic'}</label>
                            <button
                              onClick={() => copyToClipboard(orgInfo.pipeline === 'idx' ? 'OIE' : 'Classic')}
                              className="whitespace-nowrap rounded-full bg-indigo-100 px-2.5 py-0.5 text-sm text-indigo-700 float-right">Copy</button>
                          </dd>
                        </div>

                        <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
                          <dt className="font-medium text-gray-900">OrgCell</dt>
                          <dd className="text-gray-700 sm:col-span-2">
                            <label>{orgInfo.cell.toUpperCase()}</label>
                            <button
                              onClick={() => copyToClipboard(orgInfo.cell.toUpperCase())}
                              className="whitespace-nowrap rounded-full bg-indigo-100 px-2.5 py-0.5 text-sm text-indigo-700 float-right">Copy</button>
                          </dd>
                        </div>

                        <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
                          <dt className="font-medium text-gray-900">Okta URL</dt>
                          <dd className="text-gray-700 sm:col-span-2">
                            <a href={orgInfo._links.organization.href} rel="noreferrer" target="_blank">{orgInfo._links.organization.href}</a>
                            <button
                              onClick={() => copyToClipboard(orgInfo._links.organization.href)}
                              className="whitespace-nowrap rounded-full bg-indigo-100 px-2.5 py-0.5 text-sm text-indigo-700 float-right">Copy</button>
                          </dd>
                        </div>

                        {orgInfo._links.alternate && (
                          <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
                            <dt className="font-medium text-gray-900">Custom URL</dt>
                            <dd className="text-gray-700 sm:col-span-2">
                              <a href={orgInfo._links.alternate.href} rel="noreferrer" target="_blank">{orgInfo._links.alternate.href}</a>
                              <button
                                onClick={() => copyToClipboard(orgInfo._links.alternate.href)}
                                className="whitespace-nowrap rounded-full bg-indigo-100 px-2.5 py-0.5 text-sm text-indigo-700 float-right">Copy</button>
                            </dd>
                          </div>
                        )}

                        {orgInfo.alternates && orgInfo.alternates.map((alternate, index) => (
                          <div key={index} className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
                            <dt className="font-medium text-gray-900">Custom URL</dt>
                            <dd className="text-gray-700 sm:col-span-2">
                              <a href={alternate.href} rel="noreferrer" target="_blank">{alternate.href}</a>
                              <button
                                onClick={() => copyToClipboard(alternate.href)}
                                className="whitespace-nowrap rounded-full bg-indigo-100 px-2.5 py-0.5 text-sm text-indigo-700 float-right">Copy</button>
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>) :
                    (<div>
                      <pre style={{ overflowX: 'auto' }}>{JSON.stringify(orgInfo, null, 2)}</pre>
                    </div>)}
                </div>
                <div className="inline-flex items-center">
                  <label className="inline-flex items-center cursor-pointer mt-6">
                    <input
                      type="checkbox"
                      value=""
                      className="sr-only peer"
                      onChange={(e) => { setShowRaw(e.target.checked) }}
                      checked={showRaw}
                    />
                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    <span className="ms-3 text-sm font-medium">Show Raw</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;