# 🍕 Pizza Maker 3D

A fun and interactive 3D pizza customization website where you can create unique pizza shapes using sliders!

## Features

- **Dynamic 3D Pizza Generation**: Create pizzas with 3-20 sides using a polygon-based approach
- **Real-time Customization**: Adjust the number of sides and extrusion height with smooth sliders
- **Interactive 3D View**: Drag to rotate, scroll to zoom around your pizza
- **Beautiful UI**: Modern, responsive design with pizza-themed colors
- **Realistic Lighting**: Professional 3D lighting with shadows and highlights
- **Pizza Toppings**: Visual toppings are automatically added for realism

## How to Use

1. **Open the Website**: Simply open `index.html` in your web browser
2. **Adjust Sides**: Use the "Number of Sides" slider to change from triangle (3) to icosagon (20)
3. **Change Height**: Use the "Extrusion Height" slider to make your pizza thicker or thinner
4. **Explore**: Drag with your mouse to rotate the pizza, scroll to zoom in/out

## Controls

- **Mouse Drag**: Rotate the pizza around
- **Mouse Scroll**: Zoom in and out
- **Sides Slider**: Change the number of sides (3-20)
- **Extrusion Slider**: Change the thickness (0.1-2.0)

## Technical Details

- Built with **Three.js** for 3D graphics
- Uses **ExtrudeGeometry** to create 3D shapes from 2D polygons
- **OrbitControls** for smooth camera interaction
- Responsive design that works on desktop and mobile
- Real-time geometry regeneration for smooth customization

## File Structure

```
PizzaMaker/
├── index.html      # Main HTML file
├── styles.css      # CSS styling and responsive design
├── script.js       # Three.js implementation and controls
└── README.md       # This file
```

## Browser Compatibility

Works best in modern browsers with WebGL support:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Future Enhancements

- More customization options (crust thickness, toppings, colors)
- Save/load pizza designs
- Export 3D models
- More realistic pizza textures
- Animation effects

Enjoy creating your perfect pizza! 🍕✨
