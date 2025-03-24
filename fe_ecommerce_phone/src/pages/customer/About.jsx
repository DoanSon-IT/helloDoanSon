import React, { useState, useEffect } from "react";

const About = () => {
    const [scrollY, setScrollY] = useState(0);
    const [rotatePhone, setRotatePhone] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
            setRotatePhone(window.scrollY * 0.1);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <main className="py-10 px-4 sm:px-6 lg:px-8 bg-black text-white w-full">
            <section className="w-full max-w-7xl mx-auto text-center mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-4">Về chúng tôi</h2>
                <p className="text-gray-300 text-base sm:text-lg md:text-xl max-w-lg mx-auto">
                    Chào mừng đến với Phone Store - nơi cung cấp những chiếc điện thoại
                    thông minh hiện đại nhất với mức giá tốt nhất thị trường. Chúng tôi
                    cam kết mang đến trải nghiệm mua sắm tuyệt vời cho bạn!
                </p>

                {/* 3D Phone Effect */}
                <div
                    className="mt-16 relative"
                    style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
                >
                    <div
                        className="w-64 h-96 mx-auto relative"
                        style={{
                            transform: `rotateY(${rotatePhone}deg) rotateX(${scrollY * 0.05}deg)`,
                            transition: "transform 0.1s ease-out",
                        }}
                    >
                        {/* Phone Frame */}
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-gray-800 to-black shadow-2xl" />

                        {/* Phone Screen */}
                        <div className="absolute inset-1 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
                            <div className="grid grid-cols-4 gap-2 p-4">
                                {[...Array(16)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="bg-white bg-opacity-20 rounded-lg aspect-square"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Phone Camera */}
                        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-16 h-2 bg-black rounded-full flex justify-center items-center">
                            <div className="w-2 h-2 bg-gray-700 rounded-full" />
                        </div>

                        {/* Phone Button */}
                        <div className="absolute -right-1 top-24 w-1 h-10 bg-gray-700 rounded-l-md" />

                        {/* Glow Effect */}
                        <div
                            className="absolute -inset-4 bg-blue-500 rounded-full opacity-20 blur-2xl"
                            style={{
                                animation: "pulse 3s infinite",
                                transformStyle: "preserve-3d",
                            }}
                        />
                    </div>

                    {/* Floating Specs */}
                    <div
                        className="absolute top-1/4 -right-4 bg-white bg-opacity-10 backdrop-blur-lg p-4 rounded-xl shadow-lg"
                        style={{
                            transform: `translateX(${scrollY * -0.2}px) rotateY(-20deg)`,
                            transition: "transform 0.1s ease-out",
                        }}
                    >
                        <div className="text-sm">5G</div>
                        <div className="font-bold">Ultra Fast</div>
                    </div>

                    <div
                        className="absolute bottom-1/4 -left-4 bg-white bg-opacity-10 backdrop-blur-lg p-4 rounded-xl shadow-lg"
                        style={{
                            transform: `translateX(${scrollY * 0.2}px) rotateY(20deg)`,
                            transition: "transform 0.1s ease-out",
                        }}
                    >
                        <div className="text-sm">Camera</div>
                        <div className="font-bold">108MP</div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default About;