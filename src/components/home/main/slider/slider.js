import React, { Component } from "react";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import Slicker from "react-slick";

import Img from "../../../../img/fetures.png";

import "./slider.css";

export default class slider extends Component {
  render() {
    var settings = {
      dots: true,
      infinite: true,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
      speed: 300,
      autoplaySpeed: 2000,
      cssEase: "linear",
      nextArrow: <SampleNextArrow />,
      prevArrow: <SamplePrevArrow />,
    };

    return (
      <div className="container mt-3 mb-5">
        <div className="row flex">
          <div className="col-lg-6">
            <img src={Img} style={{ width: "100%" }} />
          </div>

          <div className="col-lg-6 container shadow p-5">
            <h3 style={{ fontFamily: "Roboto Slab, serif" }}>
              Greate Fetures Included
            </h3>
            <Slicker {...settings}>
              {/* slide1 start */}

              <div className=" block-texts p-5 slider">
                You Can Share Emoji With Chat
              </div>

              <div className=" block-texts p-5 slider">
                You Can Share Images In Best Quality
              </div>

              <div className=" block-texts p-5 slider">
                Easy To Add New Chat
              </div>

              <div className=" block-texts p-5 slider">
                Make New Friends With Just A Signup
              </div>
              {/* slide1 end */}
            </Slicker>
          </div>
        </div>
      </div>
    );
  }
}

function SampleNextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, display: "none" }}
      onClick={onClick}
    />
  );
}

function SamplePrevArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, display: "none" }}
      onClick={onClick}
    />
  );
}
