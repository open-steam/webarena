/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Alejandro Sandoval Parra, University of Paderborn, 2015
 *
 */

function ResourceManager() {};

ResourceManager.staticUIResources = ['ui_static_graphical_ellipse',
                                    'ui_static_graphical_line',
                                    'ui_static_graphical_polygon',
                                    'ui_static_graphical_rectangle',
                                    'ui_static_graphical_arrow',
                                    'ui_static_graphical_coordinatesystem',
                                    'ui_static_graphical_table',
                                    'ui_static_graphical_timeline',
                                    'ui_static_texts_simpletext',
                                    'ui_static_texts_textarea',
                                    'ui_static_connections_exit',
                                    'ui_static_connections_subroom',
                                    'ui_static_content_file',
                                    'ui_static_tools_canUsersRequestCoupling',
                                    'ui_static_controls_colorpicker',
                                    'ui_static_controls_opacitycontroler',

                                    // mobile UI
                                    'mb_ui_static_graphical_menu'
                                    ];

ResourceManager.staticUIOnlyAdminResources = [
                                                'ui_static_tools_coupling',
                                                'ui_static_tools_chatIcon',
                                                'ui_static_tools_grantFullRightsIcon'
                                            ];

exports = module.exports = ResourceManager;
