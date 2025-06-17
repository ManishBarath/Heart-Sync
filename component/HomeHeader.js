import { View, Text, Platform } from 'react-native'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { blurhash } from '../utils/common';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import { MenuItems } from './CustomMenuItems';
import {Feather , AntDesign} from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const ios = Platform.OS == 'ios';
export default function HomeHeader() {
    const {top} = useSafeAreaInsets();
    const {logout} = useAuth();
    const handleProfile = () => {
        console.log('Profile clicked');
    }

    const handleLogout = async () => {
        // console.log('Logout clicked');
        try{
            await logout();
        }catch (error) {
            console.error('Logout error:', error);
        }
    }
  return (
    <View className="justify-between flex-row bg-red-400 pb-6 px-5 rounded-b-3xl" style = {{paddingTop: ios?  top : top + 10}} >
        <View>
            <Text style = {{fontSize: hp(3)}} className='text-white font-medium '>
                Chats
            </Text>
        </View>
        <View>
            <Menu>
                <MenuTrigger customStyles={
                    {
                        triggerWrapper: {
                            padding: 5,
                            borderRadius: 100,
                            backgroundColor: 'white',
                            shadowColor: '#000',
                            shadowOffset: {
                                width: 0,
                                height: 2,
                            },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                            elevation: 5,
                        }
                    }
                }>
                    <Image
                        style={{height : hp(4.3) , aspectRatio: 1, borderRadius: 100}}
                        source="https://picsum.photos/seed/696/3000/2000"
                        placeholder={{ blurhash }}
                        transition={1000}
                    />
                </MenuTrigger>
                <MenuOptions
                    customStyles={{
                        optionsContainer: {
                            width: 160,
                            borderRadius: 10,
                            borderCurve: 'continuous',
                            padding: 0,
                            marginTop: 40,
                            marginLeft: -30,
                            backgroundColor: 'white',
                            shadowOffset: {
                                width: 0,
                                height: 0,
                            },
                            shadowOpacity: 0.2
                            // shadowRadius: 3.84,
                            // elevation: 5,
                        }
                    }
                } 
                >
                    <MenuItems
                       text ="Profile"
                       action ={ handleProfile}
                       value = {null}
                       icon = {<Feather name = "user" size={hp(2.5)} color="#737373" />}
                    />
                    <Divider />
                    <MenuItems
                       text ="Sign Out"
                       action={handleLogout}
                       value = {null}
                       icon = {<AntDesign name = "logout" size={hp(2.5)} color="#737373" />}
                    />
                </MenuOptions>
            </Menu>
        </View>
    </View>
  )
} 

const Divider = () => {
    return (
        <View className='p-[1px] w-full bg-neutral-200'  />
    );
}