import React, { useState, useEffect } from "react";

const COLOR_MAP = {
  vanilla: '#F5F5DC',
  chocolate: '#8B4513',
  strawberry: '#FF69B4',
  lemon: '#FFFACD',
  raspberry: '#DC143C',
  mint: '#98FB98',
  coffee: '#D2691E',
  carrot: '#FFA500'
};

export default function ProductPreview({ productType, state }) {
  const [isHovered, setIsHovered] = useState(false);
  const [rotation, setRotation] = useState(0);
  const product = productType || "cake";

  useEffect(() => {
    if (!isHovered) return undefined;
    const interval = window.setInterval(() => {
      setRotation((prev) => (prev + 1.2) % 360);
    }, 45);
    return () => window.clearInterval(interval);
  }, [isHovered]);

  const renderCake = () => {
    const frostColor = COLOR_MAP[state.frostColor] || '#F5F5DC';
    const layers = [];
    const layerCount = Math.max(state.layers?.count || 1, 1);

    for (let i = 0; i < layerCount; i++) {
      const y = 200 - i * 25;
      const width = 200 - i * 20;
      const height = 30;
      layers.push(
        <g key={`layer-${i}`}>
          <rect x={150 - width/2} y={y} width={width} height={height} fill={frostColor} />
          <rect x={150 - width/2 + width - 5} y={y} width={5} height={height} fill="#8B4513" opacity="0.6" />
        </g>
      );
    }

    const toppings = [];
    const topTierY = 200 - (layerCount - 1) * 25 - 35;

    (state.toppings || []).forEach((topping, index) => {
      const name = topping.name.toLowerCase();
      if (name.includes('sprinkle')) {
        for (let j = 0; j < 8; j++) {
          const x = 100 + Math.random() * 100;
          const y = topTierY - 10 + Math.random() * 20;
          toppings.push(<rect key={`sprinkle-${index}-${j}`} x={x} y={y} width="3" height="3" fill="#F7D76A" />);
        }
      } else if (name.includes('fruit')) {
        const x = 120 + index * 20;
        const y = topTierY - 5;
        toppings.push(<circle key={`fruit-${index}`} cx={x} cy={y} r="4" fill="#E84F64" />);
        toppings.push(<circle key={`fruit2-${index}`} cx={x+10} cy={y} r="4" fill="#4169E1" />);
      } else if (name.includes('choco')) {
        const x = 110 + index * 15;
        const y = topTierY - 8;
        toppings.push(<path key={`choco-${index}`} d={`M${x},${y} Q${x+5},${y-3} ${x+10},${y}`} stroke="#7A4B36" strokeWidth="2" fill="none" />);
      } else if (name.includes('glitter')) {
        const x = 130 + index * 18;
        const y = topTierY - 6;
        toppings.push(<polygon key={`glitter-${index}`} points={`${x},${y-4} ${x+2},${y} ${x+4},${y-4} ${x+2},${y+2}`} fill="#D8C4E5" />);
      } else if (name.includes('flower')) {
        const x = 140 + index * 16;
        const y = topTierY - 7;
        for (let p = 0; p < 5; p++) {
          const angle = (p / 5) * Math.PI * 2;
          const px = x + Math.cos(angle) * 3;
          const py = y + Math.sin(angle) * 3;
          toppings.push(<circle key={`petal-${index}-${p}`} cx={px} cy={py} r="1.5" fill="#FFB6C1" />);
        }
      } else if (name.includes('pearl')) {
        const x = 125 + index * 22;
        const y = topTierY - 4;
        toppings.push(<circle key={`pearl-${index}`} cx={x} cy={y} r="3" fill="white" stroke="#E0E0E0" strokeWidth="1" />);
      }
    });

    const decorations = [];
    if (state.decorations?.includes('Birthday Candles')) {
      for (let c = 0; c < 3; c++) {
        const x = 120 + c * 20;
        decorations.push(<rect key={`candle-${c}`} x={x} y={topTierY - 25} width="2" height="15" fill="#F5DEB3" />);
        decorations.push(<polygon key={`flame-${c}`} points={`${x},${topTierY-25} ${x+1},${topTierY-28} ${x+2},${topTierY-25}`} fill="#FFD700" />);
      }
    }
    if (state.decorations?.includes('Sparkler')) {
      decorations.push(<rect x="160" y={topTierY - 20} width="1" height="12" fill="#C0C0C0" />);
      for (let d = 0; d < 5; d++) {
        const dx = 155 + Math.random() * 10;
        const dy = topTierY - 25 + Math.random() * 10;
        decorations.push(<circle key={`spark-${d}`} cx={dx} cy={dy} r="1" fill="#FFD700" />);
      }
    }
    if (state.decorations?.includes('Ribbon Border')) {
      decorations.push(<rect x="75" y="195" width="150" height="2" fill="#FF69B4" />);
    }
    if (state.decorations?.includes('Number Candle')) {
      decorations.push(<rect x="180" y={topTierY - 30} width="3" height="20" fill="#F5DEB3" />);
      decorations.push(<text x="181.5" y={topTierY - 15} textAnchor="middle" fontSize="8" fill="#000">{state.numCandle || '1'}</text>);
    }

    return (
      <svg viewBox="0 0 300 280" width="260" height="240">
        <defs>
          <linearGradient id="cakeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F0E4D7" />
            <stop offset="100%" stopColor="#D2B48C" />
          </linearGradient>
        </defs>
        <rect x="50" y="220" width="200" height="20" fill="url(#cakeGradient)" rx="10" />
        {layers}
        {toppings}
        {decorations}
      </svg>
    );
  };

  const renderCupcake = () => {
    const quantity = state.quantity || 1;
    const cupcakes = [];

    for (let q = 0; q < quantity; q++) {
      const offsetX = q * 80 - (quantity - 1) * 40;
      const baseX = 150 + offsetX;

      // Base trapezoid
      cupcakes.push(
        <polygon key={`base-${q}`} points={`${baseX-25},240 ${baseX+25},240 ${baseX+20},200 ${baseX-20},200`} fill="#B8765A" />
      );

      // Wrapper lines
      for (let l = 0; l < 3; l++) {
        const lx = baseX - 15 + l * 10;
        cupcakes.push(<line key={`line-${q}-${l}`} x1={lx} y1="200" x2={lx} y2="240" stroke="#9A5846" strokeWidth="1" />);
      }

      // Frosting swirl
      const frostColor = COLOR_MAP[state.frostColor] || '#F3C1D4';
      cupcakes.push(
        <path key={`frost-${q}`} d={`M${baseX-30},190 Q${baseX-10},170 ${baseX},180 Q${baseX+10},170 ${baseX+30},190`} stroke={frostColor} strokeWidth="8" fill="none" />
      );

      // Toppings
      (state.toppings || []).forEach((topping, index) => {
        const name = topping.name.toLowerCase();
        const tx = baseX - 20 + index * 10;
        const ty = 175 + Math.sin(index) * 5;

        if (name.includes('sprinkle')) {
          cupcakes.push(<circle key={`sprinkle-${q}-${index}`} cx={tx} cy={ty} r="1.5" fill="#F7D76A" />);
        } else if (name.includes('fruit')) {
          cupcakes.push(<circle key={`fruit-${q}-${index}`} cx={tx} cy={ty} r="2" fill="#E84F64" />);
        } else if (name.includes('glitter')) {
          cupcakes.push(<polygon key={`glitter-${q}-${index}`} points={`${tx},${ty-2} ${tx+1},${ty} ${tx+2},${ty-2} ${tx+1},${ty+1}`} fill="#D8C4E5" />);
        } else if (name.includes('flower')) {
          for (let p = 0; p < 3; p++) {
            const angle = (p / 3) * Math.PI * 2;
            const px = tx + Math.cos(angle) * 2;
            const py = ty + Math.sin(angle) * 2;
            cupcakes.push(<circle key={`petal-${q}-${index}-${p}`} cx={px} cy={py} r="1" fill="#FFB6C1" />);
          }
        }
      });
    }

    return (
      <svg viewBox="0 0 300 280" width="260" height="240">
        {cupcakes}
      </svg>
    );
  };

  const renderPizza = () => {
    const sauceColors = {
      Marinara: '#DC143C',
      Pesto: '#228B22',
      White: '#FFFACD',
      BBQ: '#8B4513'
    };
    const sauceColor = sauceColors[state.sauce?.type] || '#DC143C';

    const toppings = [];
    (state.toppings || []).forEach((topping, index) => {
      const name = topping.name.toLowerCase();
      const angle = (index / (state.toppings.length || 1)) * Math.PI * 2;
      const radius = 60;
      const x = 150 + Math.cos(angle) * radius;
      const y = 140 + Math.sin(angle) * radius * 0.7;

      if (name.includes('pepperoni')) {
        toppings.push(<circle key={`pepperoni-${index}`} cx={x} cy={y} r="6" fill="#D9473C" />);
      } else if (name.includes('mushroom')) {
        toppings.push(<ellipse key={`mushroom-${index}`} cx={x} cy={y} rx="4" ry="3" fill="#B99E87" />);
        toppings.push(<rect key={`stem-${index}`} x={x-1} y={y+1} width="2" height="3" fill="#8B7355" />);
      } else if (name.includes('olive')) {
        toppings.push(<ellipse key={`olive-${index}`} cx={x} cy={y} rx="3" ry="5" fill="#2F4F2F" />);
      } else if (name.includes('bell')) {
        toppings.push(<rect key={`pepper-${index}`} x={x-3} y={y-2} width="6" height="4" fill="#32CD32" rx="1" />);
      } else if (name.includes('onion')) {
        toppings.push(<circle key={`onion-${index}`} cx={x} cy={y} r="4" fill="none" stroke="#F5F5F5" strokeWidth="2" />);
      } else if (name.includes('pineapple')) {
        toppings.push(<polygon key={`pineapple-${index}`} points={`${x},${y-4} ${x+3},${y+2} ${x-3},${y+2}`} fill="#FFD700" />);
      } else if (name.includes('jalapeño')) {
        toppings.push(<path key={`jalapeno-${index}`} d={`M${x-3},${y} Q${x},${y-3} ${x+3},${y}`} stroke="#228B22" strokeWidth="2" fill="none" />);
      } else if (name.includes('corn')) {
        for (let k = 0; k < 5; k++) {
          const kx = x - 5 + k * 2.5;
          const ky = y - 2 + Math.random() * 4;
          toppings.push(<circle key={`corn-${index}-${k}`} cx={kx} cy={ky} r="1" fill="#FFD700" />);
        }
      }
    });

    return (
      <svg viewBox="0 0 300 280" width="260" height="240">
        <defs>
          <radialGradient id="crustGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E0B16B" />
            <stop offset="100%" stopColor="#B58142" />
          </radialGradient>
        </defs>
        {/* Crust */}
        <circle cx="150" cy="140" r="85" fill="url(#crustGradient)" />
        {/* Sauce */}
        <circle cx="150" cy="140" r="75" fill={sauceColor} />
        {/* Cheese */}
        <circle cx="150" cy="140" r="70" fill="#F4E389" />
        {toppings}
      </svg>
    );
  };

  const previewRender = {
    cake: renderCake,
    pizza: renderPizza,
    cupcake: renderCupcake
  }[product] || renderCake;

  return (
    <div
      className="product-preview"
      style={{ width: "100%", minHeight: "360px", display: "flex", justifyContent: "center", alignItems: "center" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ width: "100%", maxWidth: "360px", height: "360px", position: "relative", perspective: "1100px" }}>
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            transformStyle: "preserve-3d",
            transform: `rotateX(18deg) rotateY(${rotation}deg)`,
            transition: "transform 0.28s ease"
          }}
        >
          {previewRender()}
        </div>
      </div>
    </div>
  );
}

function getGlazeColor(type) {
  const colors = {
    "Chocolate": "#8B4513",
    "Vanilla": "#FFFACD",
    "Strawberry": "#FFB6C1",
    "Maple": "#D2691E"
  };
  return colors[type] || "#FFFACD";
}

function getSprinkleEmoji(name) {
  const emojis = {
    "Rainbow": "🌈",
    "Chocolate": "🍫",
    "Coconut": "🥥",
    "Nuts": "🥜"
  };
  return emojis[name] || "✨";
}