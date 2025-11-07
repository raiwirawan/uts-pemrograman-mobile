import { CommonActions, useNavigation } from "@react-navigation/native";
import { useEffect } from "react";

export type NavigateProps = {
	to: string;
	replace?: boolean;
};

function Navigate({ to, replace }: NavigateProps) {
	const navigation = useNavigation<any>();

	useEffect(() => {
		if (replace) {
			navigation.dispatch(
				CommonActions.reset({
					index: 0,
					routes: [{ name: to }],
				})
			);
		} else {
			navigation.navigate(to);
		}
	}, [to, replace, navigation]);

	return null;
}

export default Navigate;
