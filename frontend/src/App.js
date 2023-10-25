import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
function App() {
  const [content, setContent] = useState('');
  const [selectedElement, setSelectedElement] = useState(null);
  const [selected, setSelected] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [selectedHtml, setSelectedHtml] = useState('');
  const [selectedCss, setSelectedCss] = useState([]);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [showHtmlAndCss, setShowHtmlAndCss] = useState(false);
  const [hoveredElementInfo, setHoveredElementInfo] = useState(null);
  // Function to handle right-click events
  const handleContextMenu = (event) => {
    event.preventDefault(); // Prevent the default context menu from appearing
    setShowHtmlAndCss(false)
    if (selectedElementId) {
      selectedElementId.style.backgroundColor = '';
    }

    // Set the background color of the clicked element to pink
    event.target.style.backgroundColor = 'pink';

    // Update the currently selected element and its ID
    setSelectedElementId(event.target);
    console.log(event.clientX, event.clientY)
    // Store the position of the right-click
    setContextMenuPosition({ x: event.clientX, y: event.clientY });

    // Show the custom context menu
    setContextMenuVisible(true);
    const selectedHtml = event.target.outerHTML;
    // const selectedCss = getStyles(event.target)
    const selectedCss = Array.from(getComputedStyle(event.target)).map(
      (prop) => `${prop}: ${getComputedStyle(event.target).getPropertyValue(prop)}`
    );
    // Update the state to display the HTML and CSS
    setSelected(true);
    setSelectedHtml(selectedHtml);
    setSelectedCss(selectedCss);
  };

  // Function to hide the context menu
  // const hideContextMenu = () => {
  //   setContextMenuVisible(false);
  // };

  const sanitizeHTML = (html) => {
    // Replace 'method' and 'action' attributes in the <form> tag
    const sanitizedHTML = html.replace(/<form\b[^>]*>/g, (match) => {
      return match.replace(/\s(method|action)="[^"]*"/g, ''); // Remove method and action attributes
    });

    // Add onsubmit attribute to prevent form submission
    const formWithPrevention = sanitizedHTML.replace(/<form[^>]*>/, '<form onsubmit="return false;">');

    // Remove 'required', 'type="submit"', 'id', 'name', and 'href' attributes
    const finalSanitizedHTML = formWithPrevention
      .replace(/<[^>]+? required(?:\s[^>]*)?>/g, (match) => {
        return match.replace('required', '');
      })
      .replace(/<[^>]+? type="submit"(?:\s[^>]*)?>/g, (match) => {
        return match.replace(' type="submit"', '');
      })
      .replace(/\s(id|name)="[^"]*"/g, '') // Remove id and name attributes
      .replace(/<a[^>]*\s+href="[^"]*"[^>]*>/g, (match) => {
        return match.replace(/\s+href="[^"]*"/g, ''); // Remove href attribute from <a> tags
      });

    return finalSanitizedHTML;
  };
  // const showHtmlAndCss = () => {
  //   // Get the HTML and CSS of the selected element
  //   const selectedHtml = selectedElement.outerHTML;
  //   const selectedCss = Array.from(getComputedStyle(selectedElement)).map(
  //     (prop) => `${prop}: ${getComputedStyle(selectedElement).getPropertyValue(prop)}`
  //   );

  //   // Update the state to display the HTML and CSS
  //   setSelected(true);
  //   setSelectedHtml(selectedHtml);
  //   setSelectedCss(selectedCss);

  //   // Hide the context menu
  //   hideContextMenu();
  // };

  useEffect(() => {
    // Make a request to your Flask backend
    axios.get('http://127.0.0.1:8080') // Replace with your actual route
      .then((response) => {
        const sanitizedHTML = sanitizeHTML(response.data); // Sanitize the HTML
        setContent(sanitizedHTML);
      })
      .catch((error) => console.error(error));
  }, []);

  // Function to handle hover events
  const handleHover = (event) => {
    if (selectedElement) {
      // Remove the blue border from the previously hovered element
      selectedElement.style.border = '';
    }

    // Change border color to blue on hover
    event.target.style.border = '1px solid blue';

    // Update the currently selected element
    setSelectedElement(event.target);
  };

  // Function to handle click events
  const handleClick = (event) => {
    // Remove the pink color from the previously selected element
    if (selectedElementId) {
      selectedElementId.style.backgroundColor = '';
    }

    // Set the background color of the clicked element to pink
    event.target.style.backgroundColor = 'pink';

    // Update the currently selected element and its ID
    setSelectedElementId(event.target);


  };
  const getStyles = (element) => {
    const computedStyles = {};
    // console
    // Get inline styles
    const inlineStyles = element.style.cssText;
    console.log(inlineStyles, ' inlineStyles')
    if (inlineStyles) {
      computedStyles['Inline Styles'] = inlineStyles;
    }

    // Get styles from the class that is acting on the element
    const classes = element.classList;
    classes.forEach((className) => {
      const classStyles = window.getComputedStyle(element, `.${className}`);
      if (classStyles) {
        // Extract a set of important CSS properties
        const importantStyles = {
          'margin': classStyles.margin,
          'padding': classStyles.padding,
          'border': classStyles.border,
          'font-size': classStyles.fontSize,
          'font-weight': classStyles.fontWeight,
          'color': classStyles.color,
          'background-color': classStyles.backgroundColor,
          'text-align': classStyles.textAlign,
          'line-height': classStyles.lineHeight,
          'letter-spacing': classStyles.letterSpacing,
          'text-transform': classStyles.textTransform,
          'box-shadow': classStyles.boxShadow,
          'border-radius': classStyles.borderRadius,
          'width': classStyles.width,
          'height': classStyles.height,
          'display': classStyles.display,
          'position': classStyles.position,
          'float': classStyles.float,
          'z-index': classStyles.zIndex,
        };

        computedStyles[`.${className}`] = Object.entries(importantStyles)
          .map(([key, value]) => `${key}: ${value}`)
          .join('; ');
      }
    });

    // If the element has child elements, recursively get their styles
    if (element.children.length > 0) {
      for (let i = 0; i < element.children.length; i++) {
        const child = element.children[i];
        const childStyles = getStyles(child);
        Object.assign(computedStyles, childStyles);
      }
    }
    // console.log(computedStyles, ' computedStyles')
    return computedStyles;
  };
  return (
    <div>
      {/* Render the content from the Flask backend */}
      <div
        style={{ position: 'relative' }}
        dangerouslySetInnerHTML={{ __html: content }}
        onMouseOver={handleHover}
        // onClick={handleClick}
        onContextMenu={handleContextMenu} // Handle right-click context menu
      ></div>

      {contextMenuVisible && (
        <div
          className="context_menu"
          style={{ top: contextMenuPosition.y, left: contextMenuPosition.x, position: 'absolute', backgroundColor: 'black' }}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the menu
        >
          <div style={{ margin: '14px', textAlign: 'center', color: 'white' }} onClick={() => setShowHtmlAndCss(true)}
          >
            Show HTML and CSS
          </div>
        </div>
      )}

      <div>
        {/* Display the HTML code and CSS of the selected element */}
        {selected && showHtmlAndCss && (
          <div>
            <h3>HTML:</h3>
            <pre className='show_html'>{selectedHtml}</pre>

            <h3>CSS:</h3>
            <pre className='show_html'>
              {selectedCss}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;