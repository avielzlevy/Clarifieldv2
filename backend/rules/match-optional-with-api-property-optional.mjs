// rules/match-optional-with-api-property-optional.mjs
export default {
    meta: {
        type: 'problem',
        docs: {
            description:
                'Ensure optional DTO properties use @ApiPropertyOptional() and required properties use @ApiProperty()',
        },
        schema: [],
    },
    create(context) {
        return {
            ClassDeclaration(node) {
                if (!node.id?.name.endsWith('Dto')) return;

                for (const member of node.body.body) {
                    if (
                        member.type !== 'PropertyDefinition' ||
                        member.key.type !== 'Identifier'
                    ) {
                        continue;
                    }

                    // TS parser exposes the '?' flag as `optional: true`
                    const isOptional = member.optional === true;

                    // collect decorator names
                    const decorators = member.decorators || [];
                    const names = decorators
                        .map((dec) => {
                            const expr = dec.expression;
                            return (
                                expr.type === 'CallExpression' &&
                                expr.callee.type === 'Identifier' &&
                                expr.callee.name
                            );
                        })
                        .filter(Boolean);

                    if (isOptional) {
                        // optional prop must use ApiPropertyOptional
                        if (!names.includes('ApiPropertyOptional')) {
                            context.report({
                                node: member.key,
                                message: `Optional property '${member.key.name}' must use @ApiPropertyOptional(), not @ApiProperty().`,
                            });
                        }
                    } else {
                        // required prop must NOT use ApiPropertyOptional
                        if (names.includes('ApiPropertyOptional')) {
                            context.report({
                                node: member.key,
                                message: `Required property '${member.key.name}' must use @ApiProperty(), not @ApiPropertyOptional().`,
                            });
                        }
                    }
                }
            },
        };
    },
};
