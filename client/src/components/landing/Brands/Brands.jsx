import adobeLogo from "../../../assets/logos/adobe.svg";
import atlassianLogo from "../../../assets/Logos/atlassian.svg";
import brazeLogo from "../../../assets/Logos/braze.svg";
import ghostLogo from "../../../assets/Logos/ghost.svg"
import hellosignLogo from "../../../assets/Logos/hellosign.svg"
import hubspotLogo from "../../../assets/Logos/hubspot.svg"
import intercomLogo from "../../../assets/Logos/intercom.svg"
import mazeLogo from "../../../assets/Logos/maze.svg";
import opendoorLogo from "../../../assets/Logos/opendoor.svg"
import treehouseLogo from "../../../assets/Logos/treehouse.svg"

import "./Brands.css"


const logos = [
  {
    src: adobeLogo,
    name:"Adobe"
  },
  {
    src: atlassianLogo,
    name:"Atlassian"
  },
  {
    src: brazeLogo,
    name:"Braze"
  },
  {
    src: ghostLogo,
    name:"Ghost"
  },
  {
    src: hellosignLogo,
    name:"Hellosign"
  },
  {
    src: hubspotLogo,
    name:"Hubspot"
  },
  {
    src: intercomLogo,
    name:"Intercom"
  },
  {
    src: mazeLogo,
    name:"Maze"
  },
  {
    src: opendoorLogo,
    name:"Opendoor"
  },
  {
    src: treehouseLogo,
    name:"Treehouse"
  },
]

function Brands() {
  return (
    <section className="brands">
  <div className="brands-track">

    {logos.map((logo) => (
      <img
        key={`first-${logo.name}`}
        src={logo.src}
        alt={logo.name}
        className="brand-logo"
      />
    ))}

    {logos.map((logo) =>{
      <img
      key={`second-${logo.name}`} 
      src={logo.src}
      alt=""
      aria-hidden="true"
      className="brand-logo"
       />
    })}

  </div>
  <div className="brand-text">
    <h2> More than 25+ Startups around the world trusted Mentor Token!</h2>
  </div>
</section>
  );
}

export default Brands;