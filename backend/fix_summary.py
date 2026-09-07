import re

with open("app/schemas/schemas.py", "r") as f:
    content = f.read()

# Remove the model_validate classmethod
content = re.sub(r"    @classmethod\n    def model_validate[\s\S]*?return super\(\)\.model_validate\(obj_dict\)", "", content)

# Add field_validator
import_statement = "from pydantic import BaseModel, ConfigDict, field_validator\n"
content = content.replace("from pydantic import BaseModel, ConfigDict", import_statement)

validator_code = """
    @field_validator('key_topics', mode='before')
    @classmethod
    def parse_key_topics(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except:
                return []
        return v
"""
content = content.replace("    model_config = ConfigDict(from_attributes=True)", "    model_config = ConfigDict(from_attributes=True)\n" + validator_code)

with open("app/schemas/schemas.py", "w") as f:
    f.write(content)

