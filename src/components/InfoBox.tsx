import { Card, CardContent, Typography } from "@mui/material";
import "./InfoBox.css";

type InfoBoxProps = {
  title: string;
  cases: string;
  total: string | undefined;
  active?: boolean;
  isRed?: boolean;
  onClick?: () => void;
};

const InfoBox: React.FC<InfoBoxProps> = ({ title, cases, total, active, isRed, onClick }) => {
  console.log(title, active);
  return (
    <Card
      onClick={onClick}
      className={`infoBox ${active ? "infoBox--selected" : ""} ${isRed ? "infoBox--red" : ""}`}
    >
      <CardContent>
        <Typography color="textSecondary" gutterBottom>
          {title}
        </Typography>
        <h2 className={`infoBox__cases ${!isRed ? "infoBox__cases--green" : ""}`}>
          {cases}
        </h2>

        <Typography className="infoBox__total" color="textSecondary">
          {total} Total
        </Typography>
      </CardContent>
    </Card>
  );
};

export default InfoBox;
