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
import { useEffect, useState } from "react";
import { getSecp256k1Point, verifySignature } from "../utils/ecdsa";
import { getBN, getSha256 } from "../utils/utils";

const MESSAGE_TYPE = {
  integer: "INTEGER",
  hashed: "HASHED"
};

const parsePublicKeyString = (privateKeyString) => {
  try {
    const { x, y } = JSON.parse(privateKeyString);

    return x && y ? getSecp256k1Point(getBN(x), getBN(y)) : false;
  } catch (e) {
    return false;
  }
};

const parseSignatureString = (signatureString) => {
  try {
    const { r, s } = JSON.parse(signatureString);

    return r && s ? { r: getBN(r), s: getBN(s) } : false;
  } catch (e) {
    return false;
  }
};

export default function VerifySignatureForm() {
  const [publicKey, setPublicKey] = useState("");
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [messageType, setMessageType] = useState(MESSAGE_TYPE.hashed);
  const [result, setResult] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const parsedSignature = parseSignatureString(signature);
  const publicKeyPoint = parsePublicKeyString(publicKey);

  const isSignatureCorrect = !!parsedSignature;
  const isPublicKeyCorrect = !!publicKeyPoint;
  const isMessageCorrect = message.length !== 0;

  const verify = () => {
    let finalMessage = message;
    if (messageType === MESSAGE_TYPE.hashed) {
      finalMessage = getSha256(message);
    }
    setResult(verifySignature(finalMessage, parsedSignature, publicKeyPoint));
    setShowResult(true);
  };

  useEffect(() => setShowResult(false), [publicKey, message, signature]);

  return (
    <Paper sx={{ p: 2, m: 3 }} elevation={4}>
      <Typography sx={{ mb: 1 }} variant="h4">
        Проверить подпись
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Alert severity="info">
            Имея <b>Публичный ключ</b>, <b>подпись</b>, и оригинальное{" "}
            <b>сообщение</b>, вы можете <b>проверить</b>, было ли данное
            сообщение действительно <b>подписано</b> соответствующим{" "}
            <b>Приватным ключом</b>, из которого бы <b>вычислен</b> данный{" "}
            <b>Публичный ключ</b>.
          </Alert>
        </Grid>
        <Grid item xs={12}>
          <TextField
            value={publicKey}
            onChange={(e) => setPublicKey(e.target.value)}
            label="Публичный ключ"
            helperText={
              publicKey &&
              !isPublicKeyCorrect &&
              "Должен быть в формате JSON, и должен содержать координаты точки (x и y), лежащей на эллиптической кривой secp256k1"
            }
            variant="outlined"
            error={publicKey && !isPublicKeyCorrect}
            required
            fullWidth
            multiline
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Подпись"
            onChange={(e) => setSignature(e.target.value)}
            value={signature}
            variant="outlined"
            helperText={
              signature &&
              !isSignatureCorrect &&
              "Должна быть в формате JSON, и должна содержать числа r и s"
            }
            error={signature && !isSignatureCorrect}
            required
            fullWidth
            multiline
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            label="Сообщение"
            type={messageType === MESSAGE_TYPE.integer ? "number" : "default"}
            multiline={messageType !== MESSAGE_TYPE.integer}
            variant="outlined"
            required
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
            onClick={verify}
            variant="contained"
            size="large"
            disabled={
              !isSignatureCorrect || !isMessageCorrect || !isPublicKeyCorrect
            }
          >
            Проверить
          </Button>
        </Grid>
        {showResult && (
          <Grid item xs={12}>
            {result ? (
              <Alert severity="success">Подпись корректна!</Alert>
            ) : (
              <Alert severity="error">Подпись некорректна!</Alert>
            )}
          </Grid>
        )}
      </Grid>
    </Paper>
  );
}
