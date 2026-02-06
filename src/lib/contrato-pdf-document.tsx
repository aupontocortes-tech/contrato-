import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 11 },
  title: { fontSize: 16, marginBottom: 20, textAlign: "center" },
  section: { marginBottom: 12 },
  label: { fontWeight: "bold", marginBottom: 4 },
  paragraph: { marginBottom: 8, textAlign: "justify" },
  footer: { marginTop: 30, fontSize: 9, color: "#666" },
});

type Props = {
  textoContrato: string;
  nomeAluno: string;
  dataGeracao: string;
};

export function ContratoPdfDocument({ textoContrato, nomeAluno, dataGeracao }: Props) {
  const linhas = textoContrato.split("\n").filter(Boolean);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</Text>
        {linhas.map((linha, i) => (
          <Text key={i} style={linha.startsWith("   ") ? styles.paragraph : styles.section}>
            {linha || " "}
          </Text>
        ))}
        <View style={styles.footer}>
          <Text>Documento gerado em {dataGeracao} — Contratado: {nomeAluno}</Text>
        </View>
      </Page>
    </Document>
  );
}
