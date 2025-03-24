function Footer() {
    return (
        <footer className="light-gray-bg-custom dark:bg-zinc-800 mt-2.5">
            <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 text-center sm:text-left">
                    <div className="mt-8">
                        <h2 className="mb-4 text-sm font-semibold text-gray-700 uppercase dark:text-white">
                            Quick Links
                        </h2>
                        <ul className="text-gray-500 dark:text-gray-400 space-y-3">
                            <li>
                                <a href="/" className="hover:underline">
                                    Home
                                </a>
                            </li>
                            <li>
                                <a href="/" className="hover:underline">
                                    About us
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:underline">
                                    Contact us
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div className="mt-8">
                        <h2 className="mb-4 text-sm font-semibold text-gray-700 uppercase dark:text-white">
                            Categories
                        </h2>
                        <ul className="text-gray-500 dark:text-gray-400 space-y-3">
                            <li>
                                <a href="/shoes" className="hover:underline">
                                    Shoes
                                </a>
                            </li>
                            <li>
                                <a href="/bags" className="hover:underline">
                                    Bags
                                </a>
                            </li>
                            <li>
                                <a href="/hats" className="hover:underline">
                                    Hats
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div className="mt-8">
                        <h2 className="mb-4 text-sm font-semibold text-gray-700 uppercase dark:text-white">
                            Follow us
                        </h2>
                        <ul className="text-gray-500 dark:text-gray-400 space-y-3">
                            <li>
                                <a href="#" className="hover:underline">
                                    Facebook
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:underline">
                                    Twitter
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:underline">
                                    Linkedin
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div className="mt-8">
                        <h2 className="mb-4 text-sm font-semibold text-gray-700 uppercase dark:text-white">
                            Legal
                        </h2>
                        <ul className="text-gray-500 dark:text-gray-400 space-y-3">
                            <li>
                                <a href="#" className="hover:underline">
                                    Privacy Policy
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:underline">
                                    Terms &amp; Conditions
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:underline">
                                    Refund Policy
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <hr className="my-6 border-gray-200 dark:border-gray-700" />

                <div className="flex flex-col sm:flex-row sm:justify-between gap-4 text-center sm:text-left">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        © 2023 Bella Fashion. All Rights Reserved.
                    </span>
                </div>
            </div>
        </footer>
    );
}

export default Footer;