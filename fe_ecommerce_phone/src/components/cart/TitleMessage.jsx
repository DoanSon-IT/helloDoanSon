import React from "react";

function TitleMessage() {
    return (
        <div className="w-11/12 md:w-4/5 mx-auto text-center mb-12">
            <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl mb-4 tracking-tight hover:text-violet-500 transition-colors duration-300">
                Giỏ hàng của bạn
            </h1>
            <p className="text-lg text-white font-medium hover:text-violet-400 transition-colors duration-300">
                Ít thì mua 10 món, nhiều thì mua cả shop!
            </p>
        </div>
    );
}

export default TitleMessage;