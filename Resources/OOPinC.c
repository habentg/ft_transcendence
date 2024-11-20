#include <stdio.h>
#define OBJ(type, newType) \
typedef struct s_newobj {\
	type parent; \
}	newType

#define ACCESS(object, parentMember) object.parent.parentMember

typedef struct s_obj {
	int num;
	void (*f)(struct s_obj*);
}	Obj;

#define SELF(self) &self.parent

OBJ(Obj, NewObj);

void printContainedNum(Obj *obj) {
	printf("%d\n", obj->num);
}

int main() {
	Obj falafel;
	falafel.num = 5;
	falafel.f = &printContainedNum;

	falafel.f(&falafel);
	NewObj inheriting;
	inheriting.parent.num = 3;
	inheriting.parent.f = &printContainedNum;

	inheriting.parent.f(&inheriting.parent);
}
