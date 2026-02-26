@all @greenkart @ui @checkout @green-kart
Feature: greenkart checkout

	Scenario: user places an order for multiple vegetables
		Given the user is on the greenkart products page
		When the user adds product "beetroot" to the cart with quantity 3
		And the user adds product "brinjal" to the cart with quantity 1
		And the user adds product "pumpkin" to the cart with quantity 1
		And the user opens the cart
		Then the cart should contain the following products:
			| product  |
			| beetroot |
			| brinjal  |
			| pumpkin  |
		And the cart total amount should be 179
		When the user places the order
		And the user selects country "Netherlands"
		And the user agrees to the terms and conditions
		And the user proceeds with the checkout
		Then the order should be placed successfully
