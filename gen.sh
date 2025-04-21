# This was planned for a command line tool, postponed for now

# cd ..
# npx create-expo-app testgen
# cd testgen
# npm run reset-project
# rm -rf ./app/index.tsx 

# cat << EOF > ./app/_layout.tsx
# import { Text, View, Pressable } from "react-native";
# import { useState } from "react";

# const comps = [{
#     id: "id1",
#     component: <Text>Hello World</Text>,
# }, {
#     id: "id2",
#     component: <Text>Goodbye World</Text>,
# }]

# export default function RootLayout() {
#     const [index,setIndex] = useState(0)
#     return (
#         <>
#             <View id={comps[index].id} collapsable={false} style={{}}>
#                 {comps[index].component}
#             </View>
#             {index<comps.length-1 ? 
#                 <Pressable id={"button"} onPress={() => setIndex(index + 1)}>
#                     <Text>Press</Text>
#                 </Pressable> : 
#             null}
#         </>
#     );
# }
# EOF

# echo "✅ Replaced App.js with Hello World."

# npx expo start -c --port 8083 &
# sleep 5

# cd ../react-native-screenshot-test
# node screenshot.js '["id1","id2"]'

# open http://localhost:8083
