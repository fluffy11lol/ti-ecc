import { Container } from "@mui/material";
import ExtractPublicKeyForm from "../components/ExtractPublicKeyForm";
import SignMessageForm from "../components/SignMessageForm";
import VerifySignatureForm from "../components/VerifySignatureForm";

export default function MainPage() {
  return (
    <Container>
      <ExtractPublicKeyForm />
      <SignMessageForm />
      <VerifySignatureForm />
    </Container>
  );
}
