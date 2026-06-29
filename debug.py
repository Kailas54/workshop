import json
kwargs = {
  'item1_name': 'Cappuccino',
  'item1_price': 150.0,
  'item1_qty': 2,
  'item2_name': 'Blueberry Muffin',
  'item2_price': 180.0,
  'item2_qty': 1
}
assignments = []
for k, v in kwargs.items():
    if isinstance(v, str): assignments.append(f'{k} = "{v}"')
    elif isinstance(v, bool): assignments.append(f'{k} = {v}')
    elif v is None: assignments.append(f'{k} = None')
    else: assignments.append(f'{k} = {v}')
assignments_str = '\n'.join(assignments)

code = '''subtotal = (item1_price * item1_qty) + (item2_price * item2_qty)'''

full_code = f'''
import json
{assignments_str}

{code}
'''

print(full_code)
for i, line in enumerate(full_code.split('\n')):
    print(f'{i+1}: {line}')
