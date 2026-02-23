import { StyleSheet, View } from "react-native";
import { StatusBar } from "react-native";
import { WebView } from 'react-native-webview'

const App = () => {
  return (
    <View style={styles.container}>
      <WebView source={{uri: 'https://summer-job-caixa-pix-por-voz.vercel.app' }}
      style={styles.web} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  web: {
    flex: 1
  }
})

export default App