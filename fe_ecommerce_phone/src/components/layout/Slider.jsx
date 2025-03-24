import React, { useState, useEffect } from "react";
import slider1 from "../../assets/slider_1.png";
import slider2 from "../../assets/slider_2.png";
import slider3 from "../../assets/slider_3.png";

const Slider = () => {
    const slides = [
        { id: 1, title: "iPhone 15 Pro Max", description: "Công nghệ dẫn đầu", image: slider1, buttonText: "Mua ngay", buttonLink: "/product/iphone-15" },
        { id: 2, title: "Samsung Galaxy Z Fold 5", description: "Màn hình gập đột phá", image: slider2, buttonText: "Khám phá", buttonLink: "/product/z-fold-5" },
        { id: 3, title: "Black Friday", description: "Giảm 50% cực sốc", image: slider3, buttonText: "Săn deal", buttonLink: "/shop" },
    ];

    const [currentSlide, setCurrentSlide] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (!isHovered) {
            const interval = setInterval(() => {
                setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
            }, 4000);
            return () => clearInterval(interval);
        }
    }, [slides.length, isHovered]);

    const goToSlide = (index) => setCurrentSlide(index);
    const goToPrevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    const goToNextSlide = () => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));

    return (
        <div
            className="relative w-full h-[45vh] sm:h-[55vh] lg:h-[65vh] xl:h-[70vh] max-h-[750px] overflow-hidden bg-black"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ease-in-out ${index === currentSlide ? "opacity-100" : "opacity-0"
                        }`}
                >
                    <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover sm:object-contain"
                        onError={(e) => (e.target.src = "https://via.placeholder.com/1200x600?text=Image+Not+Found")}
                    />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center px-4 sm:px-6">
                        <div className="text-center text-white">
                            <h2 className="text-lg sm:text-2xl lg:text-4xl font-bold tracking-wide">{slide.title}</h2>
                            <p className="mt-2 text-sm sm:text-base lg:text-lg text-gray-300">{slide.description}</p>
                            <a
                                href={slide.buttonLink}
                                className="mt-4 inline-block px-5 py-2 sm:px-6 sm:py-3 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-all duration-300"
                            >
                                {slide.buttonText}
                            </a>
                        </div>
                    </div>
                </div>
            ))}

            {/* Navigation Dots */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-3">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${index === currentSlide ? "bg-white" : "bg-gray-600 hover:bg-gray-400"
                            }`}
                    />
                ))}
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={goToPrevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 sm:p-3 bg-gray-800 bg-opacity-70 rounded-full hover:bg-opacity-90 transition-all duration-300 text-white"
            >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button
                onClick={goToNextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 sm:p-3 bg-gray-800 bg-opacity-70 rounded-full hover:bg-opacity-90 transition-all duration-300 text-white"
            >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );
};

export default Slider;