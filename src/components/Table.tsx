import "./Table.css";
import numeral from "numeral";

type CountryData = {
  country: string | undefined;
  cases: number | undefined;
};

type TableProps = {
  countries: CountryData[] | undefined;
};

function Table({ countries }: TableProps) {
  return (
    <div className="table">
      <table>
        <tbody>
          {countries?.map((country, index) => (
            <tr key={index}>
              <td>{country.country}</td>
              <td>
                <strong>{numeral(country.cases).format("0,0")}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;