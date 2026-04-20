import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AppContext } from './AppContext';
import { getBakeryMenuProduct } from './api'; // Assuming API function is imported

const CustomizePage = () => {
  const { productId } = useParams();
  const { addToCart } = useContext(AppContext);
  const [product, setProduct] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      const data = await getBakeryMenuProduct(productId);
      setProduct(data);
      setTotalPrice(data.basePrice);
    };
    fetchProduct();
  }, [productId]);

  const toggleChoice = (optionName, choice, layer = null) => {
    setSelectedOptions(prev => {
      const updated = { ...prev };
      if (!updated[optionName]) updated[optionName] = [];
      const existing = updated[optionName].find(c => c.choiceName === choice.name && c.layer === layer);
      if (existing) {
        updated[optionName] = updated[optionName].filter(c => !(c.choiceName === choice.name && c.layer === layer));
      } else {
        updated[optionName].push({ choiceName: choice.name, layer });
      }
      return updated;
    });
  };

  const updateLayer = (optionName, choice, layer) => {
    setSelectedOptions(prev => {
      const updated = { ...prev };
      updated[optionName] = updated[optionName].filter(c => c.layer !== layer);
      updated[optionName].push({ choiceName: choice.name, layer });
      return updated;
    });
  };

  const validateSelections = () => {
    // Implement validation logic similar to ProductPage.jsx
    return true; // Placeholder
  };

  useEffect(() => {
    if (product) {
      let price = product.basePrice;
      Object.values(selectedOptions).forEach(choices => {
        choices.forEach(choice => {
          const optionChoice = product.options.flatMap(o => o.choices).find(c => c.name === choice.choiceName);
          if (optionChoice) price += optionChoice.extraPrice;
        });
      });
      setTotalPrice(price);
    }
  }, [selectedOptions, product]);

  const handleAddToCart = () => {
    if (validateSelections()) {
      addToCart({
        productId,
        bakeryId: product.bakeryId,
        name: product.name,
        price: totalPrice,
        selectedOptions
      });
    }
  };

  if (!product) return <div>Loading...</div>;

  return (
    <div>
      <h1>Customize {product.name}</h1>
      {product.options.map(option => (
        <div key={option.name}>
          <h3>{option.name}</h3>
          {option.choices.map(choice => (
            <div key={choice.name}>
              <input
                type={option.maxSelections === 1 ? 'radio' : 'checkbox'}
                name={option.name}
                onChange={() => toggleChoice(option.name, choice)}
              />
              <label>{choice.name} (+${choice.extraPrice})</label>
              {option.perLayer && (
                <select onChange={(e) => updateLayer(option.name, choice, e.target.value)}>
                  <option value="1">Layer 1</option>
                  <option value="2">Layer 2</option>
                </select>
              )}
            </div>
          ))}
        </div>
      ))}
      <p>Total Price: ${totalPrice}</p>
      <button onClick={handleAddToCart}>Add to Cart</button>
    </div>
  );
};

export default CustomizePage;