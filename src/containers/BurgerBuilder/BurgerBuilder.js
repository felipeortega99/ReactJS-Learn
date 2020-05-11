import React, { Component } from "react";
import Aux from "../../hoc/Auxiliary/Auxiliary";
import Burger from "../../components/Burger/Burger";
import BuildControls from "../../components/Burger/BuildControls/BuildControls";
import Modal from "../../components/UI/Modal/Modal";
import OrderSummary from "../../components/Burger/OrderSummary/OrderSummary";
import axios from "../../axios-orders";
import Spinner from "./../../components/UI/Spinner/Spinner";
import withErrorHandler from "./../../hoc/withErrorHandler/withErrorHandler";

const INGREDIENT_PRICES = {
	salad: 12.5,
	cheese: 10,
	meat: 30,
	bacon: 20,
};

class BurgerBuilder extends Component {
	state = {
		ingredients: null,
		totalPrice: 50,
		purchasable: false,
		purchasing: false,
		loading: false,
		error: false,
	};

	componentDidMount() {
		console.log(this.props);
		axios
			.get("https://react-my-burger-99.firebaseio.com/ingredients.json")
			.then((res) => {
				this.setState({ ingredients: res.data });
			})
			.catch((error) => this.setState({ error: true }));
	}

	updatePurchaseState = (ingredients) => {
		const sum = Object.keys(ingredients)
			.map((key) => ingredients[key])
			.reduce((sum, el) => sum + el, 0);
		this.setState({ purchasable: sum > 0 });
	};

	addIngredientHandler = (type) => {
		const oldCount = this.state.ingredients[type];
		const updatedCounted = oldCount + 1;
		const updatedIngredients = { ...this.state.ingredients };
		updatedIngredients[type] = updatedCounted;
		const priceAddition = INGREDIENT_PRICES[type];
		const newPrice = this.state.totalPrice + priceAddition;

		this.setState({ totalPrice: newPrice, ingredients: updatedIngredients });

		this.updatePurchaseState(updatedIngredients);
	};

	removeIngredientHandler = (type) => {
		const oldCount = this.state.ingredients[type];
		if (oldCount <= 0) {
			return;
		}
		const updatedCounted = oldCount - 1;
		const updatedIngredients = { ...this.state.ingredients };
		updatedIngredients[type] = updatedCounted;
		const priceDeduction = INGREDIENT_PRICES[type];
		const newPrice = this.state.totalPrice - priceDeduction;

		this.setState({ totalPrice: newPrice, ingredients: updatedIngredients });

		this.updatePurchaseState(updatedIngredients);
	};

	purchaseHandler = () => {
		this.setState({ purchasing: true });
	};

	purchaseCancelHandler = () => {
		this.setState({ purchasing: false });
	};

	purchaseContinueHandler = () => {
		const queryParams = [];

		for (let i in this.state.ingredients) {
			queryParams.push(
				encodeURIComponent(i) +
					"=" +
					encodeURIComponent(this.state.ingredients[i])
			);
		}

		queryParams.push(`price=${this.state.totalPrice}`);

		const queryString = queryParams.join("&");

		this.props.history.push({
			pathname: "/checkout",
			search: `?${queryString}`,
		});
	};

	render() {
		const disabledInfo = { ...this.state.ingredients };
		let orderSummary = null;
		let burger = this.state.error ? (
			<p>Ingredients can't be loaded!</p>
		) : (
			<Spinner />
		);

		for (let key in disabledInfo) {
			disabledInfo[key] = disabledInfo[key] <= 0;
		}

		if (this.state.ingredients) {
			burger = (
				<React.Fragment>
					<Burger ingredients={this.state.ingredients} />
					<BuildControls
						price={this.state.totalPrice}
						ingredientAdded={this.addIngredientHandler}
						ingredientRemoved={this.removeIngredientHandler}
						disabled={disabledInfo}
						purchasable={this.state.purchasable}
						ordered={this.purchaseHandler}
					/>
				</React.Fragment>
			);

			orderSummary = (
				<OrderSummary
					ingredients={this.state.ingredients}
					price={this.state.totalPrice}
					purchaseCanceled={this.purchaseCancelHandler}
					purchaseContinued={this.purchaseContinueHandler}
				/>
			);
		}

		if (this.state.loading) {
			orderSummary = <Spinner />;
		}

		return (
			<Aux>
				<Modal
					show={this.state.purchasing}
					modalClosed={this.purchaseCancelHandler}
				>
					{orderSummary}
				</Modal>
				{burger}
			</Aux>
		);
	}
}

export default withErrorHandler(BurgerBuilder, axios);
