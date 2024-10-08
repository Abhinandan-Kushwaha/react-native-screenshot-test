import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface ModalBodyProps {
  title: string;
  body?: any;
  onDismiss: () => void;
}
export const ModalBody = (props: ModalBodyProps) => {
  const {title, body, onDismiss} = props;
  return (
    <View style={styles.container}>
      <Text style={{fontSize: 20, fontWeight: 'bold', color: 'black'}}>
        {title}
      </Text>
      <View style={{marginTop: 20}}>{body ?? null}</View>
      <TouchableOpacity
        onPress={onDismiss}
        style={{alignSelf: 'flex-end', marginTop: 16}}>
        <Text style={{color: '#23569E', fontWeight: 'bold', fontSize: 16}}>
          OK
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export const Loader = ({
  offset,
  batchSize,
}: {
  offset: number;
  batchSize: number;
}) => (
  <>
    <View style={styles.container}>
      <ActivityIndicator size={'large'} />

      <Text style={{color: 'gray', margin: 10}}>
        Generating the tests for components
        <Text style={{fontWeight: 'bold', color: 'black'}}>
          {`:  ${offset} to ${offset + batchSize}`}
        </Text>
      </Text>
    </View>
  </>
);

const styles = StyleSheet.create({
  container: {
    margin: 15,
    backgroundColor: 'white',
    opacity: 0.9,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: 'gray',
    padding: 20,
  },
});
