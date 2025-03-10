import numeral from "numeral";
import { Circle, Popup } from "react-leaflet";

interface CountryInfo {
  lat: number;
  long: number;
  flag: string;
}

interface CountryData {
  country: string;
  countryInfo: CountryInfo;
  cases: number;
  recovered: number;
  deaths: number;
}

type CasesType = "cases" | "recovered" | "deaths";

const casesTypeColors: Record<CasesType, { hex: string; multiplier: number }> = {
  cases: { hex: "#CC1034", multiplier: 200 },
  recovered: { hex: "#7dd71d", multiplier: 200 },
  deaths: { hex: "#fb4443", multiplier: 2000 },
};

export const sortData = (data: CountryData[]): CountryData[] =>
  [...data].sort((a, b) => b.cases - a.cases);

export const prettyPrintStat = (stat: number | undefined): string =>
  stat ? `+${numeral(stat).format("0.0a")}` : "+0";

export const showDataOnMap = (data: CountryData[], casesType: CasesType = "cases") =>
  data.map((country, index) => {
    // Check if country.countryInfo exists and has lat/long properties
    if (!country.countryInfo || typeof country.countryInfo.lat !== 'number' || typeof country.countryInfo.long !== 'number') {
      return null;
    }
    
    // Create a truly unique key using country name and index
    const uniqueKey = `${country.country}-${index}`;
    
    return (
      <Circle
        key={uniqueKey}
        center={[country.countryInfo.lat, country.countryInfo.long]}
        pathOptions={{
          color: casesTypeColors[casesType].hex,
          fillColor: casesTypeColors[casesType].hex,
          fillOpacity: 0.4,
        }}
        radius={Math.sqrt(country[casesType]) * casesTypeColors[casesType].multiplier}
      >
        <Popup>
          <div className="info-container">
            <div
              className="info-flag"
              style={{ backgroundImage: `url(${country.countryInfo.flag})` }}
            ></div>
            <div className="info-name">{country.country}</div>
            <div className="info-confirmed">Cases: {numeral(country.cases).format("0,0")}</div>
            <div className="info-recovered">Recovered: {numeral(country.recovered).format("0,0")}</div>
            <div className="info-deaths">Deaths: {numeral(country.deaths).format("0,0")}</div>
          </div>
        </Popup>
      </Circle>
    );
  }).filter(Boolean);