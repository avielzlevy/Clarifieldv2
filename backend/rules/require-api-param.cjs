// rules/require-api-param.mjs
module.exports =  {
    meta: {
        type: 'problem',
        docs: {
            description:
                'Ensure every route parameter in the path has a matching @ApiParam() decorator',
        },
        schema: [],
    },
    create(context) {
        const filename = context.getFilename();
        if (!filename.endsWith('.controller.ts')) return {};

        // HTTP method decorators to inspect
        const httpMethods = new Set([
            'Get', 'Post', 'Put', 'Patch', 'Delete', 'Options', 'Head', 'All',
        ]);

        return {
            MethodDefinition(node) {
                // Only in @Controller classes
                const classNode = node.parent?.parent;
                if (
                    !classNode ||
                    classNode.type !== 'ClassDeclaration' ||
                    !(classNode.decorators || []).some((dec) => {
                        const expr = dec.expression;
                        return (
                            expr.type === 'CallExpression' &&
                            expr.callee.type === 'Identifier' &&
                            expr.callee.name === 'Controller'
                        );
                    })
                ) {
                    return;
                }

                // Find the HTTP decorator and extract path literal
                let path = null;
                for (const dec of node.decorators || []) {
                    const expr = dec.expression;
                    if (
                        expr.type === 'CallExpression' &&
                        expr.callee.type === 'Identifier' &&
                        httpMethods.has(expr.callee.name) &&
                        expr.arguments.length > 0 &&
                        expr.arguments[0].type === 'Literal' &&
                        typeof expr.arguments[0].value === 'string'
                    ) {
                        path = expr.arguments[0].value;
                        break;
                    }
                }
                if (!path) return; // no route path to inspect

                // Collect param names in the path string, e.g. '/:id/:otherParam'
                const params = [...path.matchAll(/:([A-Za-z0-9_]+)/g)].map(m => m[1]);
                if (params.length === 0) return; // no path params

                // Collect all @ApiParam names on this method
                const apiParamNames = new Set();
                for (const dec of node.decorators || []) {
                    const expr = dec.expression;
                    if (
                        expr.type === 'CallExpression' &&
                        expr.callee.type === 'Identifier' &&
                        expr.callee.name === 'ApiParam' &&
                        expr.arguments[0]?.type === 'ObjectExpression'
                    ) {
                        for (const prop of expr.arguments[0].properties) {
                            if (
                                prop.type === 'Property' &&
                                prop.key.type === 'Identifier' &&
                                prop.key.name === 'name' &&
                                prop.value.type === 'Literal' &&
                                typeof prop.value.value === 'string'
                            ) {
                                apiParamNames.add(prop.value.value);
                            }
                        }
                    }
                }

                // Report any path param without a matching @ApiParam
                for (const param of params) {
                    if (!apiParamNames.has(param)) {
                        context.report({
                            node: node.key,
                            message: `Route parameter '${param}' in path '${path}' is missing an @ApiParam({ name: '${param}' }) decorator.`,
                        });
                    }
                }
            },
        };
    },
};
