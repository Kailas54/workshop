code = 'item1_name="Cappuccino"\\nitem1_price=150\\nitem1_qty=2'
try:
    exec(code)
    print("SUCCESS")
except Exception as e:
    print(repr(e))
