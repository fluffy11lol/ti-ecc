import {
  Button,
  FormControlLabel,
  FormLabel,
  Grid,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  Alert
} from "@mui/material";
import { useEffect, useState, useMemo } from "react";
import { signMessage } from "../utils/ecdsa";
import { getSha256 } from "../utils/utils";

const DISPLAY_VARIANT = {
  jsonDec: "1",
  jsonHex: "2"
};

const MESSAGE_TYPE = {
  integer: "1",
  hashed: "2"
};

export default function SignMessageForm() {
  const [privateKey, setPrivateKey] = useState("");
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState();
  const [displayVariant, setDisplayVariant] = useState(DISPLAY_VARIANT.jsonDec);
  const [messageType, setMessageType] = useState(MESSAGE_TYPE.hashed);

  const isPrivateKeyValid = !Number.isNaN(Number(privateKey));
  const isMessageValid = message.length !== 0;

  const sign = () => {
    let finalMessage = message;
    if (messageType === MESSAGE_TYPE.hashed) {
      finalMessage = getSha256(message);
    }

    setSignature(signMessage(finalMessage, privateKey));
  };

  useEffect(() => setSignature(null), [privateKey, message, messageType]);

  const displayedSignature = useMemo(() => {
    if (!signature || !signature.r || !signature.s) {
      return null;
    }

    switch (displayVariant) {
      case DISPLAY_VARIANT.jsonDec:
        return JSON.stringify(
          {
            r: signature.r.toFixed(),
            s: signature.s.toFixed()
          },
          null,
          2
        );

      case DISPLAY_VARIANT.jsonHex:
        return JSON.stringify(
          {
            r: "0x" + signature.r.toString(16),
            s: "0x" + signature.s.toString(16)
          },
          null,
          2
        );

      default:
        return null;
    }
  }, [signature, displayVariant]);

  return (
    <Paper sx={{ p: 2, m: 3 }} elevation={4}>
      <Typography sx={{ mb: 1 }} variant="h4">
        Подписать сообщение
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Alert severity="info">
            Вы можете подписать любое <b>сообщение</b>, используя ваш{" "}
            <b>Приватный ключ</b>. Например, "хочу отправить 1 биткойн на
            следующий адрес: ..." <br />
            Любой, кто знает ваш <b>Публичный ключ</b>, оригинальное{" "}
            <b>сообщение</b> и <b>подпись</b>, сможет <b>проверить</b>,
            действительно ли <b>вы</b> подписали данное <b>сообщение</b>.
          </Alert>
        </Grid>
        <Grid item xs={12}>
          <TextField
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            label="Приватный ключ"
            error={!isPrivateKeyValid}
            helperText={
              !isPrivateKeyValid &&
              "Должен быть десятичным или шестнадцатеричным числом: 1234, 0xfff, 0x12abf..."
            }
            variant="outlined"
            required
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            label="Сообщение"
            type={messageType === MESSAGE_TYPE.integer ? "number" : "default"}
            variant="outlined"
            required
            multiline={messageType !== MESSAGE_TYPE.integer}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <FormLabel name="message">Тип сообщения</FormLabel>
          <RadioGroup
            aria-labelledby="message"
            row
            value={messageType}
            onChange={(e) => setMessageType(e.target.value)}
          >
            <FormControlLabel
              control={<Radio />}
              value={MESSAGE_TYPE.hashed}
              label="Хэш строки (sha256)"
            />
            <FormControlLabel
              control={<Radio />}
              value={MESSAGE_TYPE.integer}
              label="Целое число"
            />
          </RadioGroup>
        </Grid>
        <Grid item xs={12}>
          <Button
            onClick={() => {
              sign();
            }}
            variant="contained"
            disabled={!isMessageValid || !isPrivateKeyValid}
            size="large"
          >
            Подписать
          </Button>
        </Grid>
        {displayedSignature && (
          <>
            <Grid item xs={12}>
              <Typography variant="h4">Подпись:</Typography>
            </Grid>
            <Grid item xs={12}>
              <Grid item xs={12}>
                <TextField
                  multiline
                  value={displayedSignature}
                  variant="outlined"
                  disabled
                  fullWidth
                />
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <FormLabel name="signature-format">Формат</FormLabel>
              <RadioGroup
                aria-labelledby="signature-format"
                row
                value={displayVariant}
                onChange={(e) => setDisplayVariant(e.target.value)}
              >
                <FormControlLabel
                  control={<Radio />}
                  value={DISPLAY_VARIANT.jsonDec}
                  label="JSON decimal"
                />
                <FormControlLabel
                  control={<Radio />}
                  value={DISPLAY_VARIANT.jsonHex}
                  label="JSON hexadecimal"
                />
              </RadioGroup>
            </Grid>
          </>
        )}
      </Grid>
    </Paper>
  );
}
