// import { useEffect, useState } from 'react';

// function Componentes() {
//   const [url, setUrl] = useState('');

//   useEffect(() => {
//     const handleKeyDown = (event) => {
//       if (event.key.toLowerCase() === "a") {
//         event.preventDefault();
//         const customUrl = "https://example.com";
//         setUrl(customUrl);
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, []);

//   return (
//     <div>
//       <h2>Component View (/componentes)</h2>
//       {url ? (
//         <iframe
//           src={url}
//           style={{ width: '100%', height: '300px', border: '1px solid #ccc' }}
//           title="Opened URL"
//         />
//       ) : (
//         <p>Press "A" key to open URL inside this component.</p>
//       )}
//     </div>
//   );
// }

// export default Componentes;