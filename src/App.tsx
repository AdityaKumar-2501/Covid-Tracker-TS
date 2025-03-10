import { useState, useEffect } from "react";
import "./App.css";
import {
  MenuItem,
  FormControl,
  Select, SelectChangeEvent,
  Card,
  CardContent,
} from "@mui/material";
import InfoBox from "./components/InfoBox";
import LineGraph from "./components/LineGraph";
import Table from "./components/Table";
import { sortData, prettyPrintStat } from "./components/util";
import numeral from "numeral";

import Map from "./components/Map";
import "leaflet/dist/leaflet.css";

interface CountryInfo {
  country: string;
  countryInfo: { lat: number; long: number; iso2: string; flag: string };
  cases: number;
  todayCases: number;
  recovered: number;
  todayRecovered: number;
  deaths: number;
  todayDeaths: number;
}

interface Country {
  name: string;
  value: string;
}

type CasesType = "cases" | "recovered" | "deaths";

const App: React.FC = () => {
  const [country, setInputCountry] = useState<string>("worldwide");
  const [countryInfo, setCountryInfo] = useState<CountryInfo>({
    country: "",
    countryInfo: { lat: 0, long: 0, iso2: "", flag: "" },
    cases: 0,
    todayCases: 0,
    recovered: 0,
    todayRecovered: 0,
    deaths: 0,
    todayDeaths: 0,
  });
  const [countries, setCountries] = useState<Country[]>([]);
  const [mapCountries, setMapCountries] = useState<CountryInfo[]>([]);
  const [tableData, setTableData] = useState<CountryInfo[]>([]);
  const [casesType, setCasesType] = useState<CasesType>("cases");
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(
    { lat: 34.80746, lng: -40.4796 }
  );
  const [mapZoom, setMapZoom] = useState<number>(3);

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, []);

  useEffect(() => {
    const getCountriesData = async () => {
      fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countries: Country[] = data.map((country: CountryInfo) => ({
            name: country.country,
            value: country.countryInfo.iso2,
          }));
          const sortedData = sortData(data).map((country: any) => ({
            ...country,
            countryInfo: {
              ...country.countryInfo,
              iso2: country.countryInfo.iso2 || "",
              flag: country.countryInfo.flag || "",
            },
          }));
          setCountries(countries);
          setMapCountries(data);
          setTableData(sortedData);
        });
    };
    getCountriesData();
  }, []);

  const onCountryChange = async (e: SelectChangeEvent<string>) => {
    const countryCode = e.target.value as string;
    const url =
      countryCode === "worldwide"
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
      .then((response) => response.json())
      .then((data: CountryInfo) => {
        setInputCountry(countryCode);
        setCountryInfo(data);

        if (countryCode === "worldwide") {
          setMapCenter({ lat: 34.80746, lng: -40.4796 });
        } else if (data.countryInfo) {
          console.log({ lat: data.countryInfo.lat, lng: data.countryInfo.long });
          setMapCenter({ lat: data.countryInfo.lat, lng: data.countryInfo.long });
        }
        setMapZoom(4);
      });
  };

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>COVID-19 Tracker</h1>
          <FormControl className="app__dropdown">
            <Select
              variant="outlined"
              value={country}
              onChange={onCountryChange}
            >
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {countries.map((country) => (
                <MenuItem key={country.value} value={country.value}>
                  {country.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div className="app__stats">
          <InfoBox
            onClick={() => setCasesType("cases")}
            title="Coronavirus Cases"
            isRed
            active={casesType === "cases"}
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={numeral(countryInfo.cases).format("0.0a")}
            // total={(countryInfo.cases)}

          />
          <InfoBox
            onClick={() => setCasesType("recovered")}
            title="Recovered"
            active={casesType === "recovered"}
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={numeral(countryInfo.recovered).format("0.0a")}
            // total={(countryInfo.recovered)}

          />
          <InfoBox
            onClick={() => setCasesType("deaths")}
            title="Deaths"
            isRed
            active={casesType === "deaths"}
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={numeral(countryInfo.deaths).format("0.0a")}
            // total={(countryInfo.deaths)}

          />
        </div>
        <Map
          countries={mapCountries}
          casesType={casesType}
          center={[mapCenter.lat, mapCenter.lng]}
          zoom={mapZoom}
        />
      </div>
      <div className="app__right">
        <Card className="app__right">
          <CardContent>
            <div className="app__information">
              <h3>Live Cases by Country</h3>
              <Table countries={tableData} />
              <h3>Worldwide new {casesType}</h3>
              <LineGraph casesType={casesType} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default App;
