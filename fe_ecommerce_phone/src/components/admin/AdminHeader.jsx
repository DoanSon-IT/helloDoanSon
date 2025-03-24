const Header = () => {
    return (
        <div className="bg-white dark:bg-gray-800 p-4 shadow-md flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Admin Dashboard</h2>
            <div className="flex items-center space-x-4">
                <input
                    type="text"
                    placeholder="Search..."
                    className="p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
            </div>
        </div>
    );
};

export default Header;