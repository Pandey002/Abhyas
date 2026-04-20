import React from 'react';
import './ImagePlaceholders.css';

const ImagePlaceholders = () => {
  const images = [
    { label: 'TACTILE PRECISION' },
    { label: 'OPEN JOURNAL' },
    { label: 'STORED WISDOM' },
  ];

  return (
    <section className="placeholders-section">
      <div className="container">
        <div className="placeholders-grid">
          {images.map((img, i) => (
            <div key={i} className="placeholder-card">
              <div className="placeholder-image">
                <div className="geometric-shape"></div>
              </div>
              <span className="placeholder-label">{img.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImagePlaceholders;
