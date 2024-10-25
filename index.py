def to_jaden_case(string):
    c = 'a'
    c = c - 32
    print(c, flush=True)
    jaden_case_list = string.split()
    sentence = " ".join(word.capitalize() for word in jaden_case_list)
    return sentence

print(to_jaden_case("hello world"), flush=True) # "Hello World"