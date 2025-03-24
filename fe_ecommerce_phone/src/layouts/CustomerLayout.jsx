import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import AnnouncementBar from "../components/layout/AnnouncementBar";
import ScrollToTop from "../components/common/ScrollToTop";

const CustomerLayout = () => {
    return (
        <div className="min-h-screen bg-white w-full flex flex-col">
            <AnnouncementBar />
            <Header />
            <ScrollToTop />
            <main className="flex w-full flex-grow items-center justify-center">
                <div className="w-full">
                    <Outlet />
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default CustomerLayout;